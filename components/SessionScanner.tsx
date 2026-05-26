import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Camera,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Copy,
  Bookmark,
  Zap,
  Clock,
  CheckCircle,
  Loader2,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { getScraperScript, getBookmarkletHref } from '../utils/browserScript';
import { InstagramUser } from '../types';
import { parseInstagramJSON } from '../utils/instagramParser';

declare const chrome: any;

interface SessionScannerProps {
    onDataLoaded: (following: InstagramUser[], followers: InstagramUser[]) => void;
}

const neoBtn = 'neo-btn font-black uppercase tracking-wide transition-all';
const neoCard = 'border-[3px] border-slate-50 bg-slate-900';
const neoShadow = { boxShadow: '4px 4px 0 #000000' };
const neoShadowLg = { boxShadow: '6px 6px 0 #000000' };

type ScanMethod = 'desktop' | 'mobile';

const detectMobile = () => {
    const ua = navigator.userAgent;
    const mobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const narrowScreen = window.matchMedia('(max-width: 768px)').matches;
    return mobileUa || (coarsePointer && narrowScreen);
};

export const SessionScanner: React.FC<SessionScannerProps> = ({ onDataLoaded }) => {
    const [activeMethod, setActiveMethod] = useState<ScanMethod>('desktop');
    const [scanState, setScanState] = useState<'idle' | 'waiting' | 'processing' | 'success'>('idle');
    const [mobileStep, setMobileStep] = useState(1);
    const [manualJson, setManualJson] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);

    const processingRef = useRef(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const bookmarkletRef = useRef<HTMLAnchorElement>(null);

    const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
    const instagramUrl = `https://www.instagram.com/?t=${Date.now()}`;

    useEffect(() => {
        if (isExtension) return;
        setActiveMethod(detectMobile() ? 'mobile' : 'desktop');
    }, [isExtension]);

    useEffect(() => {
        if (bookmarkletRef.current) {
            bookmarkletRef.current.href = getBookmarkletHref();
        }
    }, [activeMethod]);

    const processData = useCallback((followers: any, following: any) => {
        if (processingRef.current) return;
        processingRef.current = true;

        setScanState('processing');
        try {
            const parsedFollowers = parseInstagramJSON(followers);
            const parsedFollowing = parseInstagramJSON(following);

            if (parsedFollowers.length === 0 && parsedFollowing.length === 0) {
                alert('Data is empty. Make sure the script runs until completion on Instagram.');
                setScanState('waiting');
                processingRef.current = false;
                return;
            }

            setTimeout(() => {
                onDataLoaded(parsedFollowing, parsedFollowers);
                setScanState('success');
                processingRef.current = false;
            }, 800);
        } catch (e) {
            console.error(e);
            alert('Failed to read JSON data. Make sure you copy ALL the script result text.');
            setScanState('waiting');
            processingRef.current = false;
        }
    }, [onDataLoaded]);

    const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setManualJson(val);
        if (val.length > 100) {
            try {
                const data = JSON.parse(val);
                if (data.followers && data.following) {
                    processData(data.followers, data.following);
                }
            } catch (err) { }
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                throw new Error('Clipboard API unavailable');
            }

            const text = await navigator.clipboard.readText();
            if (!text) {
                alert('Clipboard is empty or permission denied.');
                return;
            }

            setManualJson(text);

            try {
                const data = JSON.parse(text);
                if (data.followers && data.following) {
                    processData(data.followers, data.following);
                } else {
                    alert('Incorrect data format. Try running the script again.');
                }
            } catch (e) {
                alert('Data in clipboard is not valid JSON.');
            }
        } catch (err) {
            console.warn('Auto-paste failed', err);
            alert('Browser blocked auto-paste.\n\nPlease PASTE MANUALLY in the box below.');
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    const handleManualSubmit = () => {
        if (!manualJson.trim()) {
            alert('Text box is empty.');
            return;
        }
        try {
            const data = JSON.parse(manualJson);
            if (data.followers && data.following) {
                processData(data.followers, data.following);
            } else {
                alert('Invalid JSON format.');
            }
        } catch (e) {
            alert('Error Parsing JSON.');
        }
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!event.data || !event.data.type) return;
            const { type, data } = event.data;
            if (type === 'IG_DATA_SYNC') {
                processData(data.followers, data.following);
            }
        };

        const handleExtensionMessage = (message: any) => {
            if (message && message.type === 'IG_DATA_SYNC') {
                processData(message.data.followers, message.data.following);
            }
        };

        window.addEventListener('message', handleMessage);
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
            chrome.runtime.onMessage.addListener(handleExtensionMessage);
        }

        return () => {
            window.removeEventListener('message', handleMessage);
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
                chrome.runtime.onMessage.removeListener(handleExtensionMessage);
            }
        };
    }, [processData]);

    const copyScript = async () => {
        try {
            await navigator.clipboard.writeText(getScraperScript());
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
            return true;
        } catch (e) { return false; }
    };

    const handleInteractionStart = async () => {
        const copied = await copyScript();
        if (copied) {
            if (mobileStep === 1) setMobileStep(2);
        }
    };

    const handleDirectClick = (e: React.MouseEvent) => {
        if (activeMethod === 'mobile' && !isExtension) {
            e.preventDefault();
            alert('Do not click directly!\n\nTo avoid opening the Instagram app:\n1. Press & Hold this button.\n2. Select "Open in New Tab".\n\nThe script will be automatically copied when you press the button.');
        }
    };

    const startExtensionProcess = async () => {
        const copied = await copyScript();
        if (copied) {
            setScanState('waiting');
            window.open('https://www.instagram.com/', '_blank');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
                <div
                    className="inline-flex items-center justify-center p-4 mb-4"
                    style={{ background: '#1e293b', border: '3px solid #f8fafc', ...neoShadowLg }}
                >
                    <Camera size={32} color="#f8fafc" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-black text-slate-50 uppercase tracking-tight">
                    Connect Your IG Here
                </h2>
            </div>

            <div
                className={`${neoCard} p-6 relative overflow-hidden min-h-[400px]`}
                style={neoShadowLg}
            >

                {scanState === 'idle' && (
                    <div className="text-center h-full flex flex-col">

                        {!isExtension && (
                            <div className="flex gap-3 mb-6 justify-center w-full max-w-sm sm:max-w-md mx-auto px-1">
                                <button
                                    type="button"
                                    id="method-desktop-btn"
                                    onClick={() => setActiveMethod('desktop')}
                                    className={`${neoBtn} flex-1 flex items-center justify-center gap-2 py-3 px-5 sm:px-8 text-xs sm:text-sm whitespace-nowrap ${activeMethod === 'desktop' ? 'neo-btn-primary' : ''}`}
                                >
                                    <Monitor size={16} strokeWidth={2.5} />
                                    Desktop
                                </button>
                                <button
                                    type="button"
                                    id="method-mobile-btn"
                                    onClick={() => setActiveMethod('mobile')}
                                    className={`${neoBtn} flex-1 flex items-center justify-center gap-2 py-3 px-5 sm:px-8 text-xs sm:text-sm whitespace-nowrap ${activeMethod === 'mobile' ? 'neo-btn-primary' : ''}`}
                                >
                                    <Smartphone size={16} strokeWidth={2.5} />
                                    Mobile
                                </button>
                            </div>
                        )}

                        {isExtension && (
                            <button
                                onClick={startExtensionProcess}
                                className={`${neoBtn} neo-btn-primary w-full max-w-sm py-4`}
                            >
                                1. Start Scan
                            </button>
                        )}

                        {activeMethod === 'desktop' && !isExtension && (
                            <div className="animate-fade-in text-left">
                                <p className="text-slate-300 mb-6 text-center max-w-lg mx-auto text-sm font-medium">
                                    Choose the method that works best for you. Don't worry, no password needed!
                                </p>

                                <div className="flex justify-center mb-8">
                                    <div
                                        className={`${neoCard} p-5 max-w-sm w-full mx-auto`}
                                        style={neoShadow}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <span
                                                className="flex items-center justify-center w-7 h-7 text-slate-50 text-xs font-black"
                                                style={{ background: '#1e293b', border: '2px solid #f8fafc', boxShadow: '2px 2px 0 #000' }}
                                            >
                                                1
                                            </span>
                                            <h3 className="font-black text-slate-50 text-sm uppercase">Use Bookmark</h3>
                                        </div>
                                        <p className="text-xs text-slate-300 mb-4 h-8 leading-4 font-medium">
                                            Drag the button below to your <b>Bookmarks Bar</b>.
                                        </p>
                                        <a
                                            ref={bookmarkletRef}
                                            onClick={(e) => e.preventDefault()}
                                            className="flex items-center justify-center gap-2 w-full py-3 font-black cursor-grab active:cursor-grabbing text-slate-50"
                                            style={{
                                                background: '#1e293b',
                                                border: '3px dashed #f8fafc',
                                                boxShadow: '3px 3px 0 #000',
                                            }}
                                            title="Drag me to your bookmarks bar!"
                                        >
                                            <Bookmark size={16} strokeWidth={2.5} />
                                            <span>Scan IG Followers</span>
                                        </a>
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold text-center">
                                            After dragging it up, open <b>Instagram.com</b> and click the bookmark.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={() => setScanState('waiting')}
                                        className={`${neoBtn} neo-btn-primary px-8 py-3 flex items-center gap-2`}
                                    >
                                        Proceed to Next Step
                                        <ArrowRight size={16} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeMethod === 'mobile' && !isExtension && (
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3].map(s => (
                                        <div
                                            key={s}
                                            className="h-2 w-12 transition-all duration-300"
                                            style={{
                                                background: mobileStep >= s ? '#e2e8f0' : '#090b11',
                                                border: '2px solid #f8fafc',
                                                boxShadow: mobileStep >= s ? '2px 2px 0 #000' : 'none',
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="animate-fade-in flex-1 flex flex-col items-center justify-center">
                                    {mobileStep === 1 && (
                                        <div className="text-center w-full">
                                            <div className="flex justify-center mb-4">
                                                <Copy size={40} color="#f8fafc" strokeWidth={2} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-50 mb-2 uppercase">Step 1: Get The Key</h3>
                                            <p className="text-slate-300 text-sm mb-6 px-4 font-medium">
                                                Press and hold the button below to copy the secret script.
                                            </p>
                                            <button
                                                onTouchStart={handleInteractionStart}
                                                onContextMenu={handleInteractionStart}
                                                className={`${neoBtn} neo-btn-primary w-full py-5 text-lg`}
                                            >
                                                Press & Hold To Copy
                                            </button>
                                            {copyFeedback && (
                                                <p className="mt-3 text-slate-50 font-black animate-bounce text-sm uppercase">
                                                    Copied! Tap Next.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {mobileStep === 2 && (
                                        <div className="text-center w-full animate-slide-in-right">
                                            <div className="flex justify-center mb-4">
                                                <Zap size={40} color="#f8fafc" strokeWidth={2} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-50 mb-2 uppercase">Step 2: The Ninja Trick</h3>
                                            <div
                                                className={`${neoCard} p-5 text-left mb-6`}
                                                style={{ background: '#090b11', ...neoShadow }}
                                            >
                                                <p className="text-sm text-slate-50 mb-4 leading-relaxed font-medium">
                                                    To bypass restrictions, follow this carefully:
                                                </p>
                                                <ul className="space-y-3 text-xs text-slate-300 font-medium">
                                                    <li className="flex gap-2">
                                                        <span className="font-black text-slate-50">1.</span>
                                                        <span>Hold the button below & select <b>"Open in New Tab"</b>.</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="font-black text-slate-50">2.</span>
                                                        <span>In the new tab, type <code className="bg-slate-900 px-1 font-mono font-bold border border-slate-50">javascript:</code> then paste.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <a
                                                href={instagramUrl}
                                                onClick={handleDirectClick}
                                                className={`${neoBtn} neo-btn-primary block w-full py-5 text-lg no-underline text-center`}
                                            >
                                                Go To Instagram Tab
                                            </a>
                                        </div>
                                    )}

                                    {mobileStep === 3 && (
                                        <div className="text-center w-full animate-slide-in-right">
                                            <div className="flex justify-center mb-4">
                                                <Clock size={40} color="#f8fafc" strokeWidth={2} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-50 mb-2 uppercase">Step 3: Finish Scaling</h3>
                                            <p className="text-slate-300 text-sm mb-6 px-4 font-medium">
                                                Is the script done? If yes, click below!
                                            </p>
                                            <button
                                                onClick={() => setScanState('waiting')}
                                                className={`${neoBtn} neo-btn-primary w-full py-5 text-lg`}
                                            >
                                                Scan Completed!
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-10 pt-4" style={{ borderTop: '3px solid #f8fafc' }}>
                                    <button
                                        disabled={mobileStep === 1}
                                        onClick={() => setMobileStep(s => s - 1)}
                                        className={`text-sm font-black flex items-center gap-1 uppercase ${mobileStep === 1 ? 'text-slate-600' : 'text-slate-50 hover:underline'}`}
                                    >
                                        <ChevronLeft size={16} strokeWidth={2.5} />
                                        Back
                                    </button>

                                    {mobileStep < 3 && (
                                        <button
                                            onClick={() => setMobileStep(s => s + 1)}
                                            className={`${neoBtn} neo-btn-primary px-6 py-2 text-sm flex items-center gap-1`}
                                        >
                                            Next
                                            <ChevronRight size={16} strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {scanState === 'waiting' && (
                    <div className="animate-fade-in">
                        <div className="text-center mb-6">
                            <div
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-black uppercase animate-pulse text-slate-50"
                                style={{ background: '#1e293b', border: '3px solid #f8fafc', boxShadow: '3px 3px 0 #000' }}
                            >
                                <div className="w-2.5 h-2.5 bg-slate-50" />
                                Waiting for data sync...
                            </div>
                        </div>

                        <div
                            className={`${neoCard} p-5`}
                            style={{ background: '#090b11', ...neoShadow }}
                        >
                            <label className="block text-sm font-black text-slate-50 mb-4 text-center uppercase">
                                Script already running?
                            </label>

                            <button
                                onClick={handlePasteFromClipboard}
                                className={`${neoBtn} neo-btn-primary w-full py-4 mb-4 flex items-center justify-center gap-2`}
                            >
                                <ClipboardPaste size={20} strokeWidth={2.5} />
                                Auto Paste Results
                            </button>

                            <div className="relative mb-3">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full" style={{ borderTop: '2px solid #f8fafc' }} />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span
                                        className="px-2 font-black uppercase text-slate-300"
                                        style={{ background: '#090b11' }}
                                    >
                                        Or Paste Manually
                                    </span>
                                </div>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={manualJson}
                                onChange={handleManualInput}
                                placeholder="Paste the JSON result here..."
                                className="neo-input w-full h-24 p-3 text-[10px] text-slate-50 font-mono"
                            />

                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => setScanState('idle')}
                                    className={`${neoBtn} flex-1 py-3 text-sm`}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleManualSubmit}
                                    className={`${neoBtn} neo-btn-primary flex-[2] py-3 text-sm`}
                                >
                                    Analyze Now!
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {scanState === 'processing' && (
                    <div className="text-center py-10">
                        <Loader2 size={48} color="#f8fafc" strokeWidth={2.5} className="animate-spin mx-auto mb-4" />
                        <h3 className="text-slate-50 font-black uppercase">Analyzing Data...</h3>
                    </div>
                )}

                {scanState === 'success' && (
                    <div className="text-center py-10">
                        <CheckCircle size={48} color="#f8fafc" strokeWidth={2} className="mx-auto mb-4" />
                        <h3 className="text-slate-50 font-black uppercase">Success!</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
