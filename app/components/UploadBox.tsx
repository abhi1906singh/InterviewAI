import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";

export default function UploadBox({setResult}) {
    
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    function handleClick() {
        fileRef?.current?.click()
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
        setFileName(file.name)
        }
    }

    function handleCancel() {
        setFileName(null);
        if (fileRef.current) {
        fileRef.current.value=""
        }
    }

 async function handleUpload() {
  try {
    setLoading(true);
    setError(null);

    const file = fileRef.current?.files?.[0];

    if (!file) {
      setError("No file selected");
      return;
      }
          const start = performance.now();

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    setResult(data.data);

  } catch (err: any) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
    return (
        <div className="flex flex-col gap-4">
        <div className="upload-box border border-gray-400" onClick={handleClick}>
            <div>This is the upload box</div> 
            <input type="file" accept=".pdf" className="hidden" ref={fileRef} onChange={handleFileChange}/>
            <Upload />
            </div>
            {fileName && (
                <div className="flex justify-between">
             <div className="flex gap-3">
                <div className="flex items-center">{fileName }</div>
                <button onClick={handleCancel}><X/></button>
                    </div>
                <button className="submit-button" onClick={handleUpload} >Upload</button>
                    </div>
            )}
        </div>
        
    )
}