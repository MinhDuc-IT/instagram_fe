

export class DataUtil {
    public static formatlikeCount(likeCount: number): string {
        if (likeCount >= 1_000_000_000) {
            return (likeCount / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        } else if (likeCount >= 1_000_000) {
            return (likeCount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (likeCount >= 1_000) {
            return (likeCount / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else {
            return likeCount.toString();
        }
    }

    public static formatViewCount(viewCount: number): string {
        if (viewCount >= 1_000_000_000) {
            return (viewCount / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        } else if (viewCount >= 1_000_000) {
            return (viewCount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (viewCount >= 1_000) {
            return (viewCount / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else {
            return viewCount.toLocaleString();
        }
    }

    public static formatCommentTime(dateString: string): string {
        console.log('Formatting date string:', dateString);
        const now = Date.now();
        const commentDate = new Date(dateString).getTime();
        const diffMs = now - commentDate;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffYears = Math.floor(diffDays / 365);

        console.log('Now:', now, 'Comment:', commentDate, 'Diff:', diffMs);

        if (diffYears > 0) {
            return `${diffYears}y`;
        } else if (diffWeeks > 0) {
            return `${diffWeeks}w`;
        } else if (diffDays > 0) {
            return `${diffDays}d`;
        } else if (diffHours > 0) {
            return `${diffHours}h`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m`;
        } else {
            return 'now';
        }
    }
}