"use client"
import UploadBox from "../components/UploadBox";

export default function Upload() {
    return (
        <>
                <div className="flex flex-col gap-5 px-[20%] py-7.5">
                <h3 className="text-2xl font-semibold">Upload your resume here</h3>
                <h4 className="xl">Help us to get you know better by sharing your resume.</h4>
                <UploadBox />
       </div>
        </>
    )
}