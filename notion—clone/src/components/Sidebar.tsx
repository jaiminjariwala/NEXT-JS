import { MenuIcon } from "lucide-react";
import NewDocumentButton from "./NewDocumentButton";
import { Button } from "./ui/button";

// Sheet component from shadcn
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"



export default function Sidebar() {
    const menuOptions = (
        <>
            <NewDocumentButton />
        </>
    );

    return (
        // as we go upwards or cross md screen the padding should be 5
        <div className="p-2 md:p-5 bg-gray-200 relative">
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger>
                        <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                            <div>
                                {menuOptions}
                            </div>
                        </SheetHeader>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Button component from shadcn ( ui/button.tsx ) */}
            <div className="hidden md:inline">
                {menuOptions}
            </div>
        </div>
    )
}