"use client"

import { useState, useTransition, useRef } from "react"
import { DocumentType } from "@prisma/client"
import { uploadVehicleDocument, deleteVehicleDocument } from "@/app/dashboard/vehicles/actions"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Trash2, Download, AlertTriangle, Calendar, Loader2 } from "lucide-react"

interface Document {
  id: string
  fileName: string
  fileUrl: string
  documentType: DocumentType
  expiryDate: Date | null
  createdAt: Date
}

interface VehicleDocumentsProps {
  vehicleId: string
  documents: Document[]
}

export function VehicleDocuments({ vehicleId, documents }: VehicleDocumentsProps) {
  const [isPending, startTransition] = useTransition()
  const [docType, setDocType] = useState<DocumentType>("REGISTRATION")
  const [expiryDate, setExpiryDate] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) {
      toast.error("Please select a file to upload.")
      return
    }

    const file = files[0]
    const formData = new FormData()
    formData.append("file", file)
    formData.append("documentType", docType)
    if (expiryDate) {
      formData.append("expiryDate", expiryDate)
    }

    startTransition(async () => {
      const result = await uploadVehicleDocument(vehicleId, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Document uploaded successfully.")
        setExpiryDate("")
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    })
  }

  const handleDelete = (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    startTransition(async () => {
      const result = await deleteVehicleDocument(vehicleId, docId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Document deleted successfully.")
      }
    })
  }

  const getExpiryStatus = (expiryDate: Date | null) => {
    if (!expiryDate) return { label: "No Expiry", color: "text-muted-foreground" }
    
    const now = new Date()
    const expiry = new Date(expiryDate)
    const timeDiff = expiry.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

    if (daysDiff < 0) {
      return { label: "Expired", color: "text-red-500 font-semibold flex items-center gap-1", icon: AlertTriangle }
    } else if (daysDiff <= 30) {
      return { label: `Expiring soon (${daysDiff} days)`, color: "text-amber-500 font-medium flex items-center gap-1", icon: AlertTriangle }
    } else {
      return { label: expiry.toLocaleDateString(), color: "text-emerald-600 flex items-center gap-1", icon: Calendar }
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Upload Document
        </h3>
        <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Document Type</label>
            <Select value={docType} onValueChange={(val) => setDocType(val as DocumentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGISTRATION">Registration</SelectItem>
                <SelectItem value="INSURANCE">Insurance</SelectItem>
                <SelectItem value="PERMIT">Permit</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry Date (Optional)</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">File</label>
            <Input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              required
              className="cursor-pointer"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </form>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Uploaded Documents</h3>
        </div>
        <div className="overflow-x-auto">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No documents uploaded yet. Upload a registration, insurance, or permit file above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Expiry Status</TableHead>
                  <TableHead>Uploaded On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const status = getExpiryStatus(doc.expiryDate)
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-semibold capitalize">
                        {doc.documentType.toLowerCase()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={doc.fileName}>
                        {doc.fileName}
                      </TableCell>
                      <TableCell className={status.color}>
                        {status.icon && <status.icon className="h-4 w-4" />}
                        {status.label}
                      </TableCell>
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end gap-2">
                        <a
                          href={doc.fileUrl}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                          title="Download Document"
                        >
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc.id)}
                          disabled={isPending}
                          title="Delete Document"
                        >
                          <Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
