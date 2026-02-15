import { useState, useEffect } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { getShareUrls, recordShare } from '../lib/api';

export default function SocialShare({ submission, txHash, tokenId }) {
  const [urls, setUrls] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState({
    x: submission.sharedToX,
    bluesky: submission.sharedToBluesky,
    instagram: submission.sharedToInstagram,
  });

  useEffect(() => {
    if (submission.id && txHash) {
      getShareUrls(submission.id).then(setUrls).catch(() => {});
    }
  }, [submission.id, txHash]);

  useEffect(() => {
    setShared({
      x: submission.sharedToX,
      bluesky: submission.sharedToBluesky,
      instagram: submission.sharedToInstagram,
    });
  }, [submission.sharedToX, submission.sharedToBluesky, submission.sharedToInstagram]);

  const handleShare = async (platform, url) => {
    try {
      await recordShare(submission.id, platform);
      setShared((prev) => ({ ...prev, [platform]: new Date().toISOString() }));
    } catch (e) {
      console.error('Failed to record share:', e);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyInstagram = async () => {
    await navigator.clipboard.writeText(urls.instagram.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    try {
      await recordShare(submission.id, 'instagram');
      setShared((prev) => ({ ...prev, instagram: new Date().toISOString() }));
    } catch (e) {
      console.error('Failed to record share:', e);
    }
  };

  if (!urls) return null;

  const hasXHandle = !!submission.xHandle;
  const hasBlueskyHandle = !!submission.blueskyHandle;
  const hasInstagramHandle = !!submission.instagramHandle;

  return (
    <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        <Share2 size={14} /> Share
      </h3>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* X / Twitter */}
        {hasXHandle && (
          <button
            onClick={() => handleShare('x', urls.x.url)}
            className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition text-center flex items-center justify-center gap-1.5"
          >
            {shared.x ? <><Check size={14} /> Shared to X</> : 'Post to X'}
          </button>
        )}

        {/* Bluesky */}
        {hasBlueskyHandle && (
          <button
            onClick={() => handleShare('bluesky', urls.bluesky.url)}
            className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition text-center flex items-center justify-center gap-1.5"
          >
            {shared.bluesky ? <><Check size={14} /> Shared to Bluesky</> : 'Post to Bluesky'}
          </button>
        )}
      </div>

      {/* Instagram - copy caption */}
      {hasInstagramHandle && (
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              Instagram Caption {shared.instagram && <Check size={12} className="inline ml-1 text-green-600" />}
            </span>
            <button
              onClick={handleCopyInstagram}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-gray-600 whitespace-pre-wrap">{urls.instagram.caption}</p>
        </div>
      )}

      {/* OpenSea link */}
      {urls.opensea && (
        <a
          href={urls.opensea}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
        >
          View on OpenSea <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
