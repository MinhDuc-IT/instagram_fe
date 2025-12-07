'use client';
import { useEffect, useRef, useState } from 'react';
import { reels } from '../data/posts';
import ReelCard from '../components/Reels/ReelCard';

export default function Reels() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalMuted, setGlobalMuted] = useState(true);
    const [showPlayIcon, setShowPlayIcon] = useState({});
    const [showPauseIcon, setShowPauseIcon] = useState({});
    const [playing, setPlaying] = useState({});


    const itemRefs = useRef([]);
    const videoRefs = useRef([]);
    const userPaused = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-index'));
                        setActiveIndex(idx);
                    }
                });
            },
            { threshold: 0.7 }
        );

        itemRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        videoRefs.current.forEach((video, i) => {
            if (!video) return;

            // Mute toàn bộ
            video.muted = globalMuted;

            // Auto-play/pause theo activeIndex nhưng không override pause của user
            if (i === activeIndex) {
                if (!userPaused.current[i]) {
                    video.play().catch(() => {});
                }
            } else {
                video.pause();
            }
        });
    }, [activeIndex, globalMuted]);

    const togglePlay = (i) => {
        const v = videoRefs.current[i];
        if (!v) return;

        if (v.paused) {
            // ---- PLAY VIDEO ----
            userPaused.current[i] = false;
            v.play();
            setPlaying((p) => ({ ...p, [i]: true }));

            // ẩn pause icon
            setShowPauseIcon((p) => ({ ...p, [i]: false }));

            // hiện play icon và fade-out
            setShowPlayIcon((p) => ({ ...p, [i]: true }));
            setTimeout(() => {
                setShowPlayIcon((p) => ({ ...p, [i]: false }));
            }, 200);
        } else {
            // ---- PAUSE VIDEO ----
            userPaused.current[i] = true;
            v.pause();
            setPlaying((p) => ({ ...p, [i]: false }));

            // hiện pause icon (KHÔNG ẨN)
            setShowPauseIcon((p) => ({ ...p, [i]: true }));
        }
    };

    return (
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
            {reels.map((r, i) => (
                <div
                    key={r.id}
                    data-index={i}
                    ref={(el) => {
                        if (el) itemRefs.current[i] = el;
                    }}
                    className="snap-start min-h-screen flex items-center justify-center"
                >
                    <ReelCard
                        reel={r}
                        isActive={i === activeIndex}
                        videoRef={(el) => (videoRefs.current[i] = el)}
                        globalMuted={globalMuted}
                        setGlobalMuted={setGlobalMuted}
                        onTogglePlay={() => togglePlay(i)}
                        isPlaying={playing[i]}
                        showPlayIcon={showPlayIcon[i]}
                        showPauseIcon={showPauseIcon[i]}
                    />
                </div>
            ))}
        </div>
    );
}
