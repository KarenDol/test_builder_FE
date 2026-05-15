"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Subject } from "@/lib/types"

interface SubjectsManagerProps {
  initialSubjects: Subject[]
}

export function SubjectsManager({ initialSubjects }: SubjectsManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [subjectName, setSubjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectName.trim()) return

    setIsLoading(true)
    try {
      if (editingSubject) {
        await apiClientJson(`/subjects/${editingSubject.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: subjectName.trim() }),
        })
        setSubjects(
          subjects.map((s) => (s.id === editingSubject.id ? { ...s, name: subjectName.trim() } : s)),
        )
      } else {
        const data = await apiClientJson<Subject>("/subjects", {
          method: "POST",
          body: JSON.stringify({ name: subjectName.trim() }),
        })
        setSubjects([...subjects, data])
      }
      setIsDialogOpen(false)
      setSubjectName("")
      setEditingSubject(null)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setSubjectName(subject.name)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return

    await apiClientJson(`/subjects/${id}`, { method: "DELETE" })
    setSubjects(subjects.filter((s) => s.id !== id))
    router.refresh()
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSubjectName("")
    setEditingSubject(null)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Subjects</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Subject name"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !subjectName.trim()}>
                  {isLoading ? "Saving..." : editingSubject ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {subjects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(subject.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No subjects yet. Add your first subject to get started.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
