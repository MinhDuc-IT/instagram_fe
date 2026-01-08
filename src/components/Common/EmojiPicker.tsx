import React from 'react';
import EmojiPickerReact, { Theme, EmojiClickData } from 'emoji-picker-react';
import Tippy from '@tippyjs/react/headless';
import { Smile } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    className?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' | 'auto' | 'auto-start' | 'auto-end';
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
    onEmojiSelect,
    className = "",
    placement = "top-start"
}) => {
    const theme = useSelector((state: RootState) => state.theme?.theme || 'light');

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onEmojiSelect(emojiData.emoji);
    };

    return (
        <Tippy
            interactive
            trigger="click"
            placement={placement as any}
            render={(attrs) => (
                <div
                    className="z-50 shadow-2xl rounded-xl overflow-hidden"
                    tabIndex={-1}
                    {...attrs}
                >
                    <EmojiPickerReact
                        onEmojiClick={handleEmojiClick}
                        theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                        lazyLoadEmojis={true}
                        skinTonesDisabled
                        searchPlaceHolder="Search emojis..."
                        width={300}
                        height={400}
                    />
                </div>
            )}
        >
            <button
                type="button"
                className={`p-1 hover:opacity-70 transition-opacity text-gray-500 dark:text-gray-400 ${className}`}
                title="Add emoji"
                onClick={(e) => e.stopPropagation()}
            >
                <Smile size={24} />
            </button>
        </Tippy>
    );
};

export default EmojiPicker;
