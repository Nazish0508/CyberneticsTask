"use client";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Filter from "bad-words";
import AWS from "aws-sdk";  // Import AWS SDK


const filter = new Filter();

// AWS S3 Configuration (Make sure to store these details securely)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',  // Access Key ID from environment variables
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '', // Secret Access Key from environment variables
  region: process.env.AWS_REGION || 'us-east-1', // Your S3 region
});

export default function AddPost(): JSX.Element {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Error creating post.");
  const router = useRouter();

  const enhanceWithAI = async () => {
    if (enhancing || content.length < 1) {
      setEnhanceError(true);
      return;
    }
    setEnhancing(true);
    setEnhanceError(false);

    const res = await fetch("/api/enhanceMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: content }),
    });

    if (res.ok) {
      const GPTdata = await res.json();
      setContent(GPTdata.content);
    } else {
      setEnhanceError(true);
    }
    setEnhancing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToS3 = async (file: File) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',  // Your S3 Bucket name
      Key: `${Date.now()}-${file.name}`,  // Unique file name
      Body: file,
      ContentType: file.type,
      ACL: 'public-read',  // Set file as publicly readable
    };

    try {
      const data = await s3.upload(params).promise();
      return data.Location; // Return the URL of the uploaded image
    } catch (error) {
      console.error("Error uploading to S3:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(false);

    if (content.length < 1) {
      setErrorMessage("Post cannot be empty.");
      setError(true);
      setLoading(false);
      return;
    }

    if (filter.isProfane(content)) {
      setErrorMessage("Profanity is not allowed.");
      setError(true);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("content", filter.clean(content));

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadToS3(image);  // Upload image to S3 and get URL
      }

      // Prepare data for post
      const postData = {
        content: filter.clean(content),
        imageUrl,
      };

      const res = await fetch("/api/addPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        setContent("");
        setImage(null);
        setImagePreview(null);
        router.refresh();
      } else {
        setError(true);
        setErrorMessage("Failed to create post.");
      }
    } catch {
      setErrorMessage("Error creating post.");
      setError(true);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <div className="flex flex-row gap-4 relative mt-6">
        <div className="flex-grow w-3/4">
          <Textarea
            isInvalid={error}
            errorMessage={error && errorMessage}
            size="lg"
            variant="bordered"
            labelPlacement="outside"
            isDisabled={!session || enhancing}
            label={session ? "Write your thoughts:" : "Please sign in to post."}
            placeholder={session ? "Enter your amazing ideas..." : ""}
            value={content}
            maxLength={300}
            onChange={(e) => setContent(e.target.value)}
            className="h-full"
          />
        </div>

        <div className="w-1/4 flex flex-col">
          <label
            htmlFor="image-upload"
            className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer h-full min-h-32 transition-colors ${
              !session ? "opacity-50 cursor-not-allowed" : "hover:border-primary"
            }`}
          >
            {imagePreview ? (
              <div className="w-full h-full overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2">
                  <Button
                    size="sm"
                    color="danger"
                    isIconOnly
                    onClick={(e) => {
                      e.preventDefault();
                      setImage(null);
                      setImagePreview(null);
                    }}
                    isDisabled={!session}
                  >
                    X
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-center mt-2">Upload Image</p>
              </>
            )}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!session}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <Spacer y={1} />

      <div className="row flex-wrap flex items-center">
        <Button
          className="font-medium"
          color="primary"
          type="submit"
          isDisabled={!session || enhancing}
          style={{ minWidth: "100px" }}
        >
          {loading ? <Spinner size="sm" /> : "Post"}
        </Button>

        <Popover
          isOpen={enhanceError}
          onOpenChange={setEnhanceError}
          placement="right"
        >
          <PopoverTrigger>
            <Button
              isDisabled={!session || enhancing}
              style={{ marginLeft: 10, minWidth: "150px" }}
              onClick={enhanceWithAI}
              className="font-medium bg-gradient-to-r from-pink-700 to-purple-600 text-white shadow-lg"
            >
              {enhancing ? <Spinner size="sm" /> : "Enhance with AI 😎"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="p-2">Error enhancing post. Please try again.</p>
          </PopoverContent>
        </Popover>

        <p className="ml-auto">{content.length}/300</p>
      </div>

      <Spacer y={2} />
    </form>
  );
}
