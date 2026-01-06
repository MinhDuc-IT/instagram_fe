// import { useState } from "react"
// import { X, Upload } from "lucide-react"
// import { useDispatch } from "react-redux"
// import { createPostRequest } from "../redux/features/post/postSlice"

// export default function ModalCreatePost({ onClose }) {
//   const dispatch = useDispatch()
//   const [image, setImage] = useState(null)
//   const [caption, setCaption] = useState("")
//   const [preview, setPreview] = useState(null)

//   const handleImageChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       setImage(file)
//       setPreview(URL.createObjectURL(file))
//     }
//   }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     console.log("Submitting post...", { image, caption, preview });
//     try {
//       if (caption && image) {
//         console.log("Dispatching createPostRequest...");
//         dispatch(createPostRequest({
//           image,
//           caption,
//           location: "",
//           visibility: "public",
//           isLikesHidden: false,
//           isCommentsDisabled: false
//         }));
//         console.log("Dispatch successful. Closing modal.");
//         onClose();
//       } else {
//         console.warn("Missing required fields:", { caption: !!caption, image: !!image });
//         if (!image) alert("Please select an image");
//       }
//     } catch (error) {
//       console.error("Error in handleSubmit:", error);
//       alert("Something went wrong: " + error.message);
//     }
//   }

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
//           <h2 className="text-lg font-semibold">Create new post</h2>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <form onSubmit={handleSubmit} className="p-4 space-y-4">
//           {/* Image Upload */}
//           {!preview ? (
//             <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 cursor-pointer hover:border-ig-primary transition-colors">
//               <Upload className="w-12 h-12 text-gray-400 mb-4" />
//               <span className="text-lg font-semibold mb-2">Select photos from your computer</span>
//               <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//             </label>
//           ) : (
//             <div className="space-y-4">
//               <img
//                 src={preview || "/placeholder.svg"}
//                 alt="Preview"
//                 className="w-full aspect-square object-cover rounded-lg"
//               />
//               <button
//                 type="button"
//                 onClick={() => {
//                   setImage(null)
//                   setPreview(null)
//                 }}
//                 className="text-ig-primary text-sm font-semibold"
//               >
//                 Change photo
//               </button>
//             </div>
//           )}

//           {/* Caption */}
//           {preview && (
//             <>
//               <textarea
//                 placeholder="Write a caption..."
//                 value={caption}
//                 onChange={(e) => setCaption(e.target.value)}
//                 className="w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-ig-primary"
//               />

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={!caption}
//                 className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Share
//               </button>
//             </>
//           )}
//         </form>
//       </div>
//     </div>
//   )
// }
