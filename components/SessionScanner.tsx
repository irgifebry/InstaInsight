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
  Loader2
} from 'lucide-react';
import { getScraperScript, getBookmarkletHref } from '../utils/browserScript';
import { InstagramUser } from '../types';
import { parseInstagramJSON } from '../utils/instagramParser';

declare const chrome: any;

interface SessionScannerProps {
    onDataLoaded: (following: InstagramUser[], followers: InstagramUser[]) => void;
}

export const SessionScanner: React.FC<SessionScannerProps> = ({ onDataLoaded }) => {
    const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | 'extension'>('desktop');
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
        if (isExtension) {
            setDeviceType('extension');
        } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            setDeviceType('mobile');
        } else {
            setDeviceType('desktop');
        }
    }, [isExtension]);

    useEffect(() => {
        if (bookmarkletRef.current) {
            bookmarkletRef.current.href = getBookmarkletHref();
        }
    }, [deviceType]);

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
        if (deviceType === 'mobile' && !isExtension) {
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
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-purple-600 to-orange-500 rounded-2xl shadow-lg mb-4">
                    <Camera size={32} color="white" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold text-white">Connect Your IG Here</h2>
            </div>

            <div className="glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden min-h-[400px]">

                {scanState === 'idle' && (
                    <div className="text-center h-full flex flex-col">

                        {isExtension && (
                            <button onClick={startExtensionProcess} className="w-full max-w-sm py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
                                1. Start Scan
                            </button>
                        )}

                        {deviceType === 'desktop' && !isExtension && (
                            <div className="animate-fade-in text-left">
                                <p className="text-slate-300 mb-6 text-center max-w-lg mx-auto text-sm">
                                    Choose the method that works best for you. Don't worry, no password needed!
                                </p>

                                <div className="flex justify-center mb-8">
                                    <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-600 hover:border-slate-500 transition-colors group max-w-sm w-full mx-auto">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">1</span>
                                            <h3 className="font-bold text-white text-sm">Use Bookmark</h3>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4 h-8 leading-4">
                                            Drag the purple button below to your <b>Bookmarks Bar</b>.
                                        </p>
                                        <a
                                            ref={bookmarkletRef}
                                            onClick={(e) => e.preventDefault()}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-700 group-hover:bg-slate-600 border border-slate-500 border-dashed rounded-lg text-indigo-300 font-bold cursor-grab active:cursor-grabbing transition-colors"
                                            title="Drag me to your bookmarks bar!"
                                        >
                                            <Bookmark size={16} strokeWidth={2} />
                                            <span>Scan IG Followers</span>
                                        </a>
                                        <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                                            After dragging it up, open <b>Instagram.com</b> and click the bookmark.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={() => setScanState('waiting')}
                                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-green-500/50 hover:border-green-500 text-green-400 font-bold rounded-xl transition-all shadow-lg hover:shadow-green-900/20 flex items-center gap-2"
                                    >
                                        Proceed to Next Step
                                        <ArrowRight size={16} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {deviceType === 'mobile' && !isExtension && (
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-center gap-2 mb-8">
                                    {[1, 2, 3].map(s => (
                                        <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${mobileStep >= s ? 'bg-purple-500' : 'bg-slate-700'}`}></div>
                                    ))}
                                </div>

                                <div className="animate-fade-in flex-1 flex flex-col items-center justify-center">
                                    {mobileStep === 1 && (
                                        <div className="text-center w-full">
                                            <div className="flex justify-center mb-4">
                                                <Copy size={40} color="#a78bfa" strokeWidth={1.5} />
                                            </div>
                                            <h3 className="text-xl font-black text-white mb-2 italic">STEP 1: GET THE KEY</h3>
                                            <p className="text-slate-400 text-sm mb-6 px-4">
                                                Press and hold the button below to copy the secret script.
                                            </p>
                                            <button
                                                onTouchStart={handleInteractionStart}
                                                onContextMenu={handleInteractionStart}
                                                className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-purple-900/40 text-lg active:scale-95 transition-transform"
                                            >
                                                PRESS & HOLD TO COPY
                                            </button>
                                            {copyFeedback && (
                                                <p className="mt-3 text-green-400 font-bold animate-bounce text-sm">COPIED! TAP NEXT.</p>
                                            )}
                                        </div>
                                    )}

                                    {mobileStep === 2 && (
                                        <div className="text-center w-full animate-slide-in-right">
                                            <div className="flex justify-center mb-4">
                                                <Zap size={40} color="#a78bfa" strokeWidth={1.5} />
                                            </div>
                                            <h3 className="text-xl font-black text-white mb-2 italic uppercase">Step 2: The Ninja Trick</h3>
                                            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-600 text-left mb-6">
                                                <p className="text-sm text-white mb-4 leading-relaxed">
                                                    To bypass restrictions, follow this carefully:
                                                </p>
                                                <ul className="space-y-3 text-xs text-slate-300">
                                                    <li className="flex gap-2">
                                                        <span className="text-purple-400 font-bold">1.</span>
                                                        <span>Hold the button below & select <b className="text-white">"Open in New Tab"</b>.</span>
                                                    </li>
                                                    <li className="flex gap-2">
                                                        <span className="text-purple-400 font-bold">2.</span>
                                                        <span>In the new tab, type <code className="bg-slate-900 px-1 rounded text-pink-400 font-mono">javascript:</code> then paste.</span>
                                                    </li>
                                                </ul>
                                            </div>
                                            <a
                                                href={instagramUrl}
                                                onClick={handleDirectClick}
                                                className="block w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/40 text-lg no-underline text-center"
                                            >
                                                GO TO INSTAGRAM TAB
                                            </a>
                                        </div>
                                    )}

                                    {mobileStep === 3 && (
                                        <div className="text-center w-full animate-slide-in-right">
                                            <div className="flex justify-center mb-4">
                                                <Clock size={40} color="#a78bfa" strokeWidth={1.5} />
                                            </div>
                                            <h3 className="text-xl font-black text-white mb-2 italic uppercase">Step 3: Finish Scaling</h3>
                                            <p className="text-slate-400 text-sm mb-6 px-4">
                                                Is the script done? If yes, click below!
                                            </p>
                                            <button
                                                onClick={() => setScanState('waiting')}
                                                className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-900/40 text-lg"
                                            >
                                                SCAN COMPLETED!
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-10 pt-4 border-t border-slate-800">
                                    <button
                                        disabled={mobileStep === 1}
                                        onClick={() => setMobileStep(s => s - 1)}
                                        className={`text-sm font-bold flex items-center gap-1 ${mobileStep === 1 ? 'text-slate-600' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <ChevronLeft size={16} strokeWidth={2} />
                                        Back
                                    </button>

                                    {mobileStep < 3 && (
                                        <button
                                            onClick={() => setMobileStep(s => s + 1)}
                                            className="px-6 py-2 bg-slate-800 text-purple-400 font-bold rounded-lg text-sm border border-purple-900/50 flex items-center gap-1"
                                        >
                                            Next
                                            <ChevronRight size={16} strokeWidth={2} />
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
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 rounded-full border border-blue-500/30 text-blue-200 text-sm animate-pulse">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                Waiting for data sync...
                            </div>
                        </div>

                        <div className="bg-slate-800 p-5 rounded-xl border border-slate-600 shadow-inner">
                            <label className="block text-sm font-bold text-white mb-4 text-center">
                                Script already running?
                            </label>

                            <button
                                onClick={handlePasteFromClipboard}
                                className="w-full py-4 mb-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                <ClipboardPaste size={20} strokeWidth={2} />
                                Auto Paste Results
                            </button>

                            <div className="relative mb-3">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-600"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-slate-800 text-slate-400">Or Paste Manually</span>
                                </div>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={manualJson}
                                onChange={handleManualInput}
                                placeholder="Paste the JSON result here..."
                                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] text-slate-300 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                            />

                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => setScanState('idle')}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-sm transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleManualSubmit}
                                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Analyze Now!
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {scanState === 'processing' && (
                    <div className="text-center py-10">
                        <Loader2 size={48} color="#a855f7" strokeWidth={2} className="animate-spin mx-auto mb-4" />
                        <h3 className="text-white font-bold">Analyzing Data...</h3>
                    </div>
                )}

                {scanState === 'success' && (
                    <div className="text-center py-10">
                        <CheckCircle size={48} color="#22c55e" strokeWidth={1.5} className="mx-auto mb-4" />
                        <h3 className="text-white font-bold">Success!</h3>
                    </div>
                )}
            </div>
        </div>
    );
};