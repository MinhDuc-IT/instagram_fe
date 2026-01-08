'use client';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Loader } from 'lucide-react';

import { setReelsFirst, appendReels } from '../redux/features/reels/reelsSlice';
import ReelCard from '../components/Reels/ReelCard';
import { ReelService } from '../service/reelService';
import { REELS_PAGE_SIZE } from '../constants/filters';

export default function Reels() {
    const dispatch = useDispatch();
    const [reels, setReels] = useState([]);
    const [cursor, setCursor] = useState(undefined);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalMuted, setGlobalMuted] = useState(true);
    const [showPlayIcon, setShowPlayIcon] = useState({});
    const [showPauseIcon, setShowPauseIcon] = useState({});
    const [playing, setPlaying] = useState({});

    const itemRefs = useRef([]);
    const videoRefs = useRef([]);
    const userPaused = useRef([]);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchReels = async () => {
            setLoading(true);
            try {
                const response = await ReelService.getReelsPagination(REELS_PAGE_SIZE);
                console.log('API Response:', response.data);
                setReels(response.data);
                dispatch(setReelsFirst(response.data));
                setCursor(response.nextCursor);
                setHasMore(response.hasMore);
            } catch (error) {
                console.error('Failed to fetch reels:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute('data-index'));
                        setActiveIndex(idx);

                        // Load thêm khi scroll gần cuối
                        if (idx >= reels.length - 3 && cursor && hasMore && !loading) {
                            loadMore();
                        }
                    }
                });
            },
            { threshold: 0.7 },
        );

        itemRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [reels.length, cursor, loading]);

    const loadMore = async () => {
        setLoading(true);
        try {
            const response = await ReelService.getReelsPagination(REELS_PAGE_SIZE, cursor);
            setReels((prev) => [...prev, ...response.data]);
            dispatch(appendReels(response.data));
            setCursor(response.nextCursor);
            setHasMore(response.hasMore);
        } catch (error) {
            console.error('Failed to load more reels:', error);
        } finally {
            setLoading(false);
        }
    };

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
        <div ref={scrollContainerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
            {reels.map((r, i) => (
                <div
                    key={i}
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
            {loading && (
                <div className="flex justify-center items-center min-h-screen">
                    <Loader className="animate-spin w-8 h-8" />
                </div>
            )}
        </div>
    );
}
