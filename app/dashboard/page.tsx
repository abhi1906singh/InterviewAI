'use client'
import { useRouter } from "next/navigation"

export default function Page() {
    const router = useRouter();
    function handleClick() {
       router.push('/upload')
    }
    return (
        <>
            This is my dashboard page
            <button onClick={()=>handleClick()}>Go to resume app</button>
        </>
    )
}