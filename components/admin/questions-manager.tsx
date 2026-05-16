"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { QuestionEditorForm } from "@/components/admin/question-editor-form"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Question, Subject } from "@/lib/types"

interface QuestionsManagerProps {
  initialQuestions: (Question & { subjects: Subject | null })[]
  subjects: Subject[]
}

export function QuestionsManager({ initialQuestions, subjects }: QuestionsManagerProps) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question & { subjects: Subject | null } | null>(
    null,
  )
  const [filterSubject, setFilterSubject] = useState<string>("all")

  const router = useRouter()

  const filteredQuestions =
    filterSubject === "all" ? questions : questions.filter((q) => q.subject_id === filterSubject)

  const handleEdit = (question: Question & { subjects: Subject | null }) => {
    setEditingQuestion(question)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingQuestion(null)
  }

  const handleEditSuccess = () => {
    handleDialogClose()
    router.refresh()
    window.location.reload()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return

    await apiClientJson(`/questions/${id}`, { method: "DELETE" })
    setQuestions(questions.filter((q) => q.id !== id))
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All Questions</CardTitle>
          <div className="flex items-center gap-4">
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subjects.length === 0 ? (
              <Button disabled title="Create at least one subject first">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            ) : (
              <Button asChild>
                <Link href="/admin/questions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length > 0 ? (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48%] min-w-0">Question</TableHead>
                  <TableHead className="min-w-0">Subject</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-14">Points</TableHead>
                  <TableHead className="w-28 shrink-0 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="max-w-0 min-w-0 font-medium whitespace-normal">
                      <div
                        className="truncate"
                        title={question.question_text}
                      >
                        {question.question_text}
                      </div>
                    </TableCell>
                    <TableCell>
                      {question.subjects?.name ? (
                        <Badge variant="secondary">{question.subjects.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {question.question_type === "single_choice" ? "Single" : "Multiple"}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.points}</TableCell>
                    <TableCell className="w-28 shrink-0 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(question)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(question.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No questions yet. Add your first question to get started.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {editingQuestion ? (
            <>
              <DialogHeader>
                <DialogTitle>Edit question</DialogTitle>
              </DialogHeader>
              <QuestionEditorForm
                key={editingQuestion.id}
                subjects={subjects}
                initialQuestion={editingQuestion}
                onCancel={handleDialogClose}
                onSuccess={handleEditSuccess}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
