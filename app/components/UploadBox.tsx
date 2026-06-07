export default function UploadBox() {
    return (
        <>
            <div className="flex gap-5">
                Upload here:
                <input type="file"  id="file" name="file" className="bg-red-300"/>
       </div>
        </>
    )
}