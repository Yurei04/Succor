import { Button } from "@/components/ui/button";


export default function Controls ({}) {
    return (
        <div className="w-full h-full flex gap-2">
            <Button className={""} onClick={start}>{labelStart}</Button>
        </div>
    )
}
