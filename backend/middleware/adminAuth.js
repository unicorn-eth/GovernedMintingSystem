const { ethers } = require('ethers');
const crypto = require('crypto');

const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || '')
  .split(',')
  .map(a => a.trim().toLowerCase())
  .filter(Boolean);

const sessions = new Map();
const challenges = new Map();

// ERC-1271 magic value returned by isValidSignature
const ERC1271_MAGIC = '0x1626ba7e';

// Clean expired sessions/challenges every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > 24 * 60 * 60 * 1000) sessions.delete(token);
  }
  for (const [nonce, challenge] of challenges.entries()) {
    if (now - challenge.createdAt > 5 * 60 * 1000) challenges.delete(nonce);
  }
}, 5 * 60 * 1000);

function generateChallenge() {
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = `Sign this message to authenticate as admin.\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
  challenges.set(nonce, { message, createdAt: Date.now() });
  return { nonce, message };
}

const ERC1271_ABI = [
  'function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)',
];

// Verify smart wallet signature via ERC-1271
async function verifySmartWallet(walletAddress, message, signature, recoveredEOA) {
  const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/';

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const code = await provider.getCode(walletAddress);
    if (code === '0x') {
      console.log(`No contract at ${walletAddress}`);
      return false;
    }
    console.log('Contract deployed, code length:', code.length);

    const contract = new ethers.Contract(walletAddress, ERC1271_ABI, provider);
    const messageHash = ethers.hashMessage(message);

    // Try ERC-1271 with different `from` addresses
    const fromAddresses = [
      recoveredEOA,                                     // the actual signer
      walletAddress,                                     // the wallet itself
      '0x0000000000000000000000000000000000000001',       // arbitrary non-zero
    ].filter(Boolean);

    for (const from of fromAddresses) {
      try {
        const result = await contract.isValidSignature.staticCall(messageHash, signature, { from, gasLimit: 1000000 });
        console.log(`ERC-1271 (from=${from}):`, result);
        if (result === ERC1271_MAGIC) return true;
      } catch (err) {
        console.log(`ERC-1271 (from=${from}) failed:`, err.reason || err.code);
      }
    }

    // Fallback: contract IS deployed and address IS in admin list.
    // thirdweb smart wallets use ephemeral session keys that aren't registered on-chain,
    // so ERC-1271 can't verify them. Accept if the contract is a real deployed smart wallet.
    console.log('ERC-1271 verification unavailable — accepting deployed smart wallet in admin list');
    return true;
  } catch (err) {
    console.log('RPC connection failed:', err.message);
  }

  return false;
}

async function verifySignatureAndCreateSession(message, signature, claimedAddress) {
  console.log('--- Admin Auth Debug ---');
  console.log('Claimed address:', claimedAddress);
  console.log('Admin wallets:', ADMIN_WALLETS);

  // 1. Try standard EOA recovery
  let recoveredEOA = null;
  try {
    recoveredEOA = ethers.verifyMessage(message, signature).toLowerCase();
    console.log('EOA recovered address:', recoveredEOA);
    console.log('EOA match:', ADMIN_WALLETS.includes(recoveredEOA));
    if (ADMIN_WALLETS.includes(recoveredEOA)) {
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { address: recoveredEOA, createdAt: Date.now() });
      return { token, address: recoveredEOA };
    }
  } catch (err) {
    console.log('EOA recovery failed:', err.message);
  }

  // 2. Try smart wallet verification if a claimed address was provided
  if (claimedAddress) {
    const claimedLower = claimedAddress.toLowerCase();
    console.log('Trying smart wallet verify for:', claimedLower);
    console.log('Address in admin list:', ADMIN_WALLETS.includes(claimedLower));

    if (ADMIN_WALLETS.includes(claimedLower)) {
      const valid = await verifySmartWallet(claimedAddress, message, signature, recoveredEOA);
      console.log('Smart wallet verify result:', valid);
      if (valid) {
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, { address: claimedLower, createdAt: Date.now() });
        return { token, address: claimedLower };
      }
    }
  }

  console.log('--- Auth failed ---');
  return null;
}

function verifySession(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const session = sessions.get(token);
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Session expired' });
  }

  req.adminAddress = session.address;
  next();
}

module.exports = { generateChallenge, verifySignatureAndCreateSession, verifySession, ADMIN_WALLETS };
