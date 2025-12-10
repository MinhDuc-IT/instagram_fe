

export class DataUtil{
    public static formatlikeCount(likeCount: number): string {
        if (likeCount >= 1_000_000) {
            return (likeCount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (likeCount >= 1_000) {
            return (likeCount / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
        } else {
            return likeCount.toString();
        }
    }
}