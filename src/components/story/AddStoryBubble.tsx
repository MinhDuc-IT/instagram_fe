import { RootState } from "@/src/redux/store"
import { useSelector } from "react-redux"

interface Props {
  onClick: () => void
}

export default function AddStoryBubble({ onClick }: Props) {
    const {
        user,
    } = useSelector((state: RootState) => state.auth)
    return (
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
            <div className="relative">
                <img
                    src={user?.avatar || "/me.jpg"}
                    className="w-16 h-16 rounded-full border"
                />
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-sm">
                    +
                </div>
            </div>
            <span className="text-xs">Your story</span>
        </div>
    )
}
