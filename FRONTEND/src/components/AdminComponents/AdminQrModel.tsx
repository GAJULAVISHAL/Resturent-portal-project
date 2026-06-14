import { MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../../apiClient";
import { useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import AdminQrFrameSvg from "./AdminQrFrameSvg";

interface AdminQrModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PNG_EXPORT_SIZE = 1000;

const AdminQrModel = ({ isOpen, onClose }: AdminQrModalProps) => {
    const [qrLink, setQrLink] = useState<string>("");
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const handleGenerate = async () => {
        const response = await apiClient.get("/api/v1/admin/QrLink");
        setQrLink(response.data.qrLink);
        return;
    };

    const handleDownload = () => {
        if (!qrLink) {
            showToast("Generate a QR code first.");
            return;
        }

        const svgElement = qrCodeRef.current?.querySelector("svg");

        if (!svgElement) {
            showToast("QR code is not ready to download.");
            return;
        }

        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        const originalViewBox = clonedSvg.getAttribute("viewBox") ?? "0 0 421 428.1";
        const viewBoxParts = originalViewBox.split(/\s+/).map(Number);
        const sourceWidth = Number.isFinite(viewBoxParts[2]) ? viewBoxParts[2] : 421;
        const sourceHeight = Number.isFinite(viewBoxParts[3]) ? viewBoxParts[3] : 428.1;

        clonedSvg.removeAttribute("width");
        clonedSvg.removeAttribute("height");
        clonedSvg.setAttribute("viewBox", `0 0 ${sourceWidth} ${sourceHeight}`);

        const exportSize = Math.max(sourceWidth, sourceHeight);
        const centeredX = (exportSize - sourceWidth) / 2;
        const centeredY = (exportSize - sourceHeight) / 2;

        const exportSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        exportSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        exportSvg.setAttribute("width", "50%");
        exportSvg.setAttribute("height", "50%");
        exportSvg.setAttribute("viewBox", `0 0 ${exportSize} ${exportSize}`);
        exportSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        const exportBackground = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        exportBackground.setAttribute("x", "0");
        exportBackground.setAttribute("y", "0");
        exportBackground.setAttribute("width", `${exportSize}`);
        exportBackground.setAttribute("height", `${exportSize}`);
        exportBackground.setAttribute("fill", "#ffffff");

        clonedSvg.setAttribute("x", `${centeredX}`);
        clonedSvg.setAttribute("y", `${centeredY}`);
        clonedSvg.setAttribute("width", `${sourceWidth}`);
        clonedSvg.setAttribute("height", `${sourceHeight}`);

        exportSvg.appendChild(exportBackground);
        exportSvg.appendChild(clonedSvg);

        const serializedSvg = new XMLSerializer().serializeToString(exportSvg);
        const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = PNG_EXPORT_SIZE;
            canvas.height = PNG_EXPORT_SIZE;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                URL.revokeObjectURL(svgUrl);
                showToast("Unable to prepare PNG download.");
                return;
            }

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, PNG_EXPORT_SIZE, PNG_EXPORT_SIZE);
            ctx.drawImage(image, 0, 0, PNG_EXPORT_SIZE, PNG_EXPORT_SIZE);
            URL.revokeObjectURL(svgUrl);

            canvas.toBlob((pngBlob) => {
                if (!pngBlob) {
                    showToast("PNG export failed.");
                    return;
                }

                const pngUrl = URL.createObjectURL(pngBlob);
                const link = document.createElement("a");
                link.href = pngUrl;
                link.download = "restaurant-qr-code.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(pngUrl);
            }, "image/png");
        };

        image.onerror = () => {
            URL.revokeObjectURL(svgUrl);
            showToast("Failed to render QR image for PNG download.");
        };

        image.src = svgUrl;
    };

    if (!isOpen) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-start pl-20 pb-12 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 8 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    onClick={(event) => event.stopPropagation()}
                    className="relative mb-8 w-full max-w-sm rounded-lg bg-stone-100 p-4 shadow-2xl"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-1 text-neutral-600 transition hover:bg-neutral-300 hover:text-neutral-900"
                        aria-label="Close QR popup"
                    >
                        <MdClose size={18} />
                    </button>

                    <div className="flex flex-col items-center gap-6 pt-8">
                        <div className="h-full">
                            {qrLink ? (
                                <div
                                    ref={qrCodeRef}
                                    className="flex w-full items-center justify-center rounded-xl border border-black/10 bg-white p-2 shadow-inner"
                                >
                                    <AdminQrFrameSvg value={qrLink || undefined} size={300} />
                                </div>
                            ) : (
                                <p className="text-neutral-500">No QR code generated.</p>
                            )}
                        </div>

                        <div className="flex w-full gap-3">
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="flex-1 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                            >
                                Download
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                className="flex-1 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AdminQrModel;