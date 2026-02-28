import { useState, useEffect } from "react";
import { settingsService } from "../../services/settings.service";
import { Button } from "../../components/ui/Button";
import { Label } from "../../components/ui/Label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { PageLoader } from "../../components/ui/Spinner";
import { Upload, Trash2, QrCode, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [qrImage, setQrImage] = useState(null); // { url, publicId } from server
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const { data } = await settingsService.getPaymentQR();
        setQrImage(data.data.paymentQR);
      } catch {
        // no QR set yet
      } finally {
        setLoading(false);
      }
    };
    fetchQR();
  }, []);

  // Preview selected file
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return toast.error("Select a QR image first");
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("qrImage", file);
      const { data } = await settingsService.uploadPaymentQR(formData);
      setQrImage(data.data.paymentQR);
      setFile(null);
      toast.success("Payment QR code uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Remove the payment QR code?")) return;
    try {
      setDeleting(true);
      await settingsService.deletePaymentQR();
      setQrImage(null);
      toast.success("Payment QR code removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-dark mb-6">Settings</h1>

      {/* Payment QR Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Payment QR Code
          </CardTitle>
          <p className="text-sm text-slate mt-1">
            Upload your UPI / bank payment QR code. Customers will see this at
            checkout to scan and pay.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current QR */}
          {qrImage?.url ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Current QR Code</Label>
              <div className="relative inline-block rounded-xl border border-border overflow-hidden bg-white">
                <img
                  src={qrImage.url}
                  alt="Payment QR Code"
                  className="h-64 w-64 object-contain"
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Removing..." : "Remove QR"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-12 text-center">
              <ImageIcon className="h-12 w-12 text-slate mb-3" />
              <p className="text-sm text-slate">
                No payment QR code uploaded yet
              </p>
              <p className="text-xs text-slate mt-1">
                Upload one below so customers can scan &amp; pay
              </p>
            </div>
          )}

          {/* Upload section */}
          <div className="space-y-3 border-t border-border pt-4">
            <Label className="text-sm font-medium">
              {qrImage?.url ? "Replace QR Code" : "Upload QR Code"}
            </Label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-pastel/30 transition-colors">
                <Upload className="h-4 w-4" />
                Choose image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && (
                <span className="text-sm text-slate">{file.name}</span>
              )}
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-2">
                <p className="text-xs text-slate">Preview:</p>
                <div className="inline-block rounded-xl border border-border overflow-hidden bg-white">
                  <img
                    src={preview}
                    alt="QR Preview"
                    className="h-48 w-48 object-contain"
                  />
                </div>
              </div>
            )}

            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload QR Code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
