import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsAndConditionsModal({
  isOpen,
  onAccept,
  onDecline,
}: TermsAndConditionsModalProps) {
  const [hasReadFully, setHasReadFully] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const scrolled = element.scrollTop;
    const percentage = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
    setScrollPercentage(percentage);
    
    // Mark as read if scrolled to 95% or more
    if (percentage >= 95) {
      setHasReadFully(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-white/20 rounded-2xl max-w-2xl w-full p-8 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 bg-white hover:bg-gray-200 text-black p-2 rounded-full transition-all shadow-lg z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Beat License Agreement</h2>
          <p className="text-gray-400">Please read and agree to the terms before purchasing</p>
        </div>

        {/* Scrollable Content */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-black/50 border border-white/10 rounded-lg p-6 mb-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5"
        >
          <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">1. Grant of License</h3>
              <p>
                Upon purchase, the Licensor (Producer) grants the Licensee (Buyer) a non-exclusive, non-transferable license to use the instrumental (beat) for the creation of one (1) new musical composition.
              </p>
              <p className="mt-2">
                This license does not transfer ownership of the beat. All rights remain with the Licensor.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">2. License Fee</h3>
              <p>
                The Licensee agrees to pay a one-time fee of $100 USD for this Basic License.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">3. Permitted Use</h3>
              <p className="mb-2">The Licensee is allowed to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Record vocals and create one (1) song using the beat</li>
                <li>Distribute the song on digital streaming platforms (e.g., Spotify, Apple Music, YouTube)</li>
                <li>Monetize the song within the limits defined in this agreement</li>
                <li>Perform the song live</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">4. Usage Limitations</h3>
              <p className="mb-2">This license includes the following limits:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Streaming Limit: Up to 50,000 total streams</li>
                <li>Sales Limit: Up to 2,000 units sold/downloaded</li>
                <li>Music Video: One (1) music video permitted</li>
                <li>Broadcasting: Limited radio and online airplay</li>
              </ul>
              <p className="mt-2">
                If any of these limits are exceeded, the Licensee must upgrade their license to continue usage.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">5. File Delivery</h3>
              <p className="mb-2">
                The Licensee will receive the beat in MP3 format immediately upon purchase
              </p>
              <p className="mb-2">
                WAV files and stems are available upon request at no additional cost
              </p>
              <p className="mb-2 font-semibold text-white">WAV & Stems Delivery Terms:</p>
              <p className="mb-2">
                WAV files and stems will be delivered privately via secure download link or email only after purchase verification. Files are provided strictly for recording, mixing, and mastering purposes.
              </p>
              <p className="mb-2">The Licensee may NOT:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Resell, share, or distribute stems individually</li>
                <li>Use stems to create new beats or derivative instrumentals</li>
                <li>Transfer stems to third parties except for professional collaborators (e.g., mixing or mastering engineers)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">6. Ownership & Rights</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>The Licensor retains 100% ownership and copyright of the beat</li>
                <li>The Licensor reserves the right to license the beat to other buyers</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">7. Credit Requirement</h3>
              <p>
                The Licensee must credit the Licensor in all releases as follows:
              </p>
              <p className="mt-2 italic font-semibold">
                "Produced by [Producer Name]"
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">8. Restrictions</h3>
              <p className="mb-2">The Licensee may NOT:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Claim ownership of the beat</li>
                <li>Resell, lease, or sublicense the beat (in whole or in part)</li>
                <li>Register the beat or song with Content ID systems (e.g., YouTube Content ID)</li>
                <li>Use the beat for unlawful, offensive, or defamatory purposes</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">9. Remix / Customization Option</h3>
              <p className="mb-2">Remix or custom modification services are available upon request:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Not included in the base license fee</li>
                <li>Subject to additional charges depending on complexity</li>
                <li>Must be agreed upon separately</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">10. Termination</h3>
              <p className="mb-2">This license remains valid unless:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Usage limits are exceeded without upgrade</li>
                <li>Any terms of this agreement are violated</li>
              </ul>
              <p className="mt-2">
                Violation results in immediate termination of rights.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">11. Agreement</h3>
              <p>
                By purchasing this beat, the Licensee agrees to all terms outlined in this agreement.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-white mb-3">12. Contact</h3>
              <p>
                For upgrades, stems requests, or remix inquiries:
              </p>
              <p className="mt-2">
                Email: <span className="font-semibold">shhmaart@gmail.com</span> / DM on TikTok or IG: <span className="font-semibold">@shhmaart</span>
              </p>
            </section>
          </div>
        </div>

        {/* Scroll Progress Indicator */}
        <div className="w-full bg-white/10 rounded-full h-1 mb-4">
          <div
            className="bg-white h-1 rounded-full transition-all"
            style={{ width: `${scrollPercentage}%` }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 border-2 border-white/20 text-white rounded-lg font-semibold hover:border-white/40 transition-all"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={!hasReadFully}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all"
          >
            <Check className="w-5 h-5" />
            <span>{hasReadFully ? 'I Agree' : 'Scroll to agree'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
