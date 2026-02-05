import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const [manualJson, setManualJson] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [scriptCopied, setScriptCopied] = useState(false);

    const processingRef = useRef(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for manual paste focus
    const bookmarkletRef = useRef<HTMLAnchorElement>(null); // Ref for bookmarklet link

    // Check if running as Chrome Extension
    const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;

    // Dynamic URL with timestamp to force fresh load
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

    // Set bookmarklet href via DOM to bypass React security check for javascript: URLs
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
                alert("Data kosong. Pastikan script berjalan sampai selesai di Instagram.");
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
            alert("Gagal membaca data JSON. Pastikan Anda meng-copy SEMUA teks hasil script.");
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
            // Check if API is available
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                throw new Error("Clipboard API unavailable");
            }

            const text = await navigator.clipboard.readText();
            if (!text) {
                alert("Clipboard kosong atau izin ditolak.");
                return;
            }

            setManualJson(text); // Show text in textarea for feedback

            try {
                const data = JSON.parse(text);
                if (data.followers && data.following) {
                    processData(data.followers, data.following);
                } else {
                    alert("Format data salah. Coba jalankan script lagi.");
                }
            } catch (e) {
                alert("Data di clipboard bukan JSON yang valid.");
            }
        } catch (err) {
            // Fallback for browsers blocking automatic read (Common on Mobile)
            console.warn("Auto-paste failed", err);
            alert("Browser memblokir paste otomatis.\n\nSilakan PASTE MANUAL di kotak dibawah ini 👇");
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    const handleManualSubmit = () => {
        if (!manualJson.trim()) {
            alert("Kotak teks masih kosong.");
            return;
        }
        try {
            const data = JSON.parse(manualJson);
            if (data.followers && data.following) {
                processData(data.followers, data.following);
            } else {
                alert("Format JSON salah.");
            }
        } catch (e) {
            alert("Error Parsing JSON.");
        }
    };

    // Automatic Listener
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
            setScriptCopied(true);
        }
    };

    const handleDirectClick = (e: React.MouseEvent) => {
        if (deviceType === 'mobile' && !isExtension) {
            e.preventDefault();
            alert("⚠️ JANGAN KLIK LANGSUNG!\n\nAgar tidak membuka aplikasi Instagram:\n1. Tekan & Tahan tombol ini.\n2. Pilih 'Buka di Tab Baru' (Open in New Tab).\n\nScript akan otomatis tersalin saat Anda menekan tombol.");
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
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.163 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Hubungkan IG Kamu</h2>
            </div>

            <div className="glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700 relative overflow-hidden">

                {scanState === 'idle' && (
                    <div className="text-center">

                        {/* --- EXTENSION VIEW --- */}
                        {isExtension && (
                            <button onClick={startExtensionProcess} className="w-full max-w-sm py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
                                1. Mulai Scan
                            </button>
                        )}

                        {/* --- DESKTOP VIEW --- */}
                        {deviceType === 'desktop' && !isExtension && (
                            <div className="animate-fade-in text-left">
                                <p className="text-slate-300 mb-6 text-center max-w-lg mx-auto text-sm">
                                    Buat kamu yang pake PC/Laptop, pilih cara yang paling asik di bawah ini ya ges. Tenang, nggak perlu password kok!
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {/* Option 1: Bookmarklet */}
                                    <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-600 hover:border-slate-500 transition-colors group">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">1</span>
                                            <h3 className="font-bold text-white text-sm">Pake Bookmark (Gampang Banget!)</h3>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4 h-8 leading-4">
                                            Seret tombol ungu dibawah ini ke <b>Bookmarks Bar</b> browser kamu ya.
                                        </p>
                                        <a
                                            ref={bookmarkletRef}
                                            onClick={(e) => e.preventDefault()}
                                            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-700 group-hover:bg-slate-600 border border-slate-500 border-dashed rounded-lg text-indigo-300 font-bold cursor-grab active:cursor-grabbing transition-colors"
                                            title="Tarik aku ke bookmarks bar ya!"
                                        >
                                            <span>🔖</span>
                                            <span>Scan IG Followers</span>
                                        </a>
                                        <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                                            Setelah ditarik ke atas, buka <b>Instagram.com</b> lalu klik bookmark tsb.
                                        </p>
                                    </div>

                                    {/* Option 2: Console */}
                                    <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-600 hover:border-slate-500 transition-colors">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500 text-white text-xs font-bold">2</span>
                                            <h3 className="font-bold text-white text-sm">Pake Console (Gaya Developer)</h3>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4 h-8 leading-4">
                                            Copy script, tekan <code className="bg-slate-900 px-1 rounded text-yellow-500 font-mono">F12</code> di tab IG kamu, lalu Paste di Console.
                                        </p>
                                        <button
                                            onClick={async () => {
                                                await copyScript();
                                                setScriptCopied(true);
                                            }}
                                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:to-pink-500 text-white font-bold rounded-lg shadow-lg transition-all text-sm"
                                        >
                                            {scriptCopied ? "✅ Script Udah Kesalin!" : "📋 Copy Script-nya"}
                                        </button>
                                        <p className="text-[10px] text-slate-500 mt-2 italic text-center">
                                            Nanti dipaste di Console tab IG kamu ya ges.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="text-xs text-slate-500 mb-2">Kalo udah dijalanin script-nya di Instagram:</div>
                                    <button
                                        onClick={() => setScanState('waiting')}
                                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-green-500/50 hover:border-green-500 text-green-400 font-bold rounded-xl transition-all shadow-lg hover:shadow-green-900/20 flex items-center gap-2"
                                    >
                                        Lanjut ke Langkah Berikutnya
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- MOBILE VIEW --- */}
                        {deviceType === 'mobile' && !isExtension && (
                            <div className="relative">
                                {/* Link Button */}
                                <a
                                    href={instagramUrl}
                                    onTouchStart={handleInteractionStart}
                                    onContextMenu={handleInteractionStart}
                                    onClick={handleDirectClick}
                                    className="block w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 select-none no-underline cursor-pointer"
                                >
                                    1. Tekan Tahan & Pilih "Tab Baru"
                                </a>

                                {copyFeedback && (
                                    <div className="absolute top-full left-0 right-0 mt-2 text-green-400 text-xs font-bold animate-bounce">
                                        Script Udah Kesalin!
                                    </div>
                                )}

                                <div className="mt-6 p-4 bg-slate-800/80 border border-slate-600 rounded-lg text-left max-w-sm mx-auto">
                                    <p className="text-white text-xs font-bold mb-3 text-center uppercase tracking-wider border-b border-slate-700 pb-2">
                                        Baca Dulu Bentar
                                    </p>
                                    <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-3">
                                        <li>
                                            <span className="text-white font-bold">Tekan & Tahan</span> tombol ungu diatas.
                                        </li>
                                        <li>
                                            Pilih <span className="text-yellow-400 font-bold">"Buka di Tab Baru"</span> (Open in New Tab).
                                            <div className="text-[10px] text-green-400 mt-1 italic pl-4">
                                                *Script otomatis tersalin saat Anda menekan tombol.
                                            </div>
                                        </li>
                                        <li>
                                            Di tab Instagram baru: Ketik <code>javascript:</code> di address bar, lalu PASTE.
                                        </li>
                                        <li>
                                            Kembali kesini & klik tombol dibawah.
                                        </li>
                                    </ol>
                                </div>

                                <div className="mt-6 animate-fade-in-up">
                                    <div className="flex flex-col items-center">
                                        <button
                                            onClick={() => setScanState('waiting')}
                                            className="w-full max-w-sm py-3 bg-slate-800 hover:bg-slate-700 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-indigo-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>👇</span>
                                            Klik Disini Setelah Buka IG
                                        </button>
                                    </div>
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
                                Lagi Nungguin Data Masuk...
                            </div>
                        </div>

                        <div className="bg-slate-800 p-5 rounded-xl border border-slate-600 shadow-inner">
                            <label className="block text-sm font-bold text-white mb-4 text-center">
                                Script sudah dijalankan?
                            </label>

                            <button
                                onClick={handlePasteFromClipboard}
                                className="w-full py-4 mb-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                Paste Otomatis (Gaspol!)
                            </button>

                            <div className="relative mb-3">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-600"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-slate-800 text-slate-400">Atau Paste Manual</span>
                                </div>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={manualJson}
                                onChange={handleManualInput}
                                placeholder='Paste hasil script JSON disini...'
                                className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-[10px] text-slate-300 focus:outline-none focus:border-purple-500 font-mono transition-colors"
                            />

                            <div className="flex gap-3 mt-3">
                                <button
                                    onClick={() => setScanState('idle')}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-sm transition-colors"
                                >
                                    Kembali
                                </button>
                                <button
                                    onClick={handleManualSubmit}
                                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    Proses Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {scanState === 'processing' && (
                    <div className="text-center py-10">
                        <div className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <h3 className="text-white font-bold">Menganalisa Data...</h3>
                    </div>
                )}

                {scanState === 'success' && (
                    <div className="text-center py-10">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-white font-bold">Berhasil!</h3>
                    </div>
                )}

            </div>
        </div>
    );
};