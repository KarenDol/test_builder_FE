"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { apiClientJson } from "@/lib/client-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Question, Subject, Test } from "@/lib/types"

interface TestWithRelations extends Test {
  subjects: Subject | null
  test_questions: {
    id: string
    question_order: number
    questions: { id: string; question_text: string; points: number } | null
  }[]
}

interface TestsManagerProps {
  initialTests: TestWithRelations[]
  subjects: Subject[]
  questions: (Question & { subjects: Subject | null })[]
}

export function TestsManager({ initialTests, subjects, questions }: TestsManagerProps) {
  const [tests, setTests] = useState(initialTests)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<TestWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subjectId, setSubjectId] = useState("__all__")
  const [duration, setDuration] = useState(60)
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [isActive, setIsActive] = useState(false)

  const router = useRouter()

  const filteredQuestions =
    subjectId === "__all__" || !subjectId
      ? questions
      : questions.filter((q) => q.subject_id === subjectId)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSubjectId("__all__")
    setDuration(60)
    setSelectedQuestions([])
    setIsActive(false)
    setEditingTest(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || selectedQuestions.length === 0) return

    setIsLoading(true)

    try {
      const body = {
        title: title.trim(),
        description: description.trim() || null,
        subject_id: !subjectId || subjectId === "__all__" ? null : subjectId,
        duration_minutes: duration,
        is_active: isActive,
        question_ids: selectedQuestions,
      }
      if (editingTest) {
        await apiClientJson(`/tests/${editingTest.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        })
        router.refresh()
        window.location.reload()
      } else {
        await apiClientJson("/tests", {
          method: "POST",
          body: JSON.stringify(body),
        })
        router.refresh()
        window.location.reload()
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving test:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (test: TestWithRelations) => {
    setEditingTest(test)
    setTitle(test.title)
    setDescription(test.description || "")
    setSubjectId(test.subject_id || "__all__")
    setDuration(test.duration_minutes || 60)
    setSelectedQuestions(test.test_questions.map((tq) => tq.questions?.id).filter(Boolean) as string[])
    setIsActive(test.is_active)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return

    await apiClientJson(`/tests/${id}`, { method: "DELETE" })
    setTests(tests.filter((t) => t.id !== id))
  }

  const handleToggleActive = async (test: TestWithRelations) => {
    const res = await apiClientJson<{ is_active: boolean }>(`/tests/${test.id}/toggle-active`, {
      method: "POST",
    })
    setTests(tests.map((t) => (t.id === test.id ? { ...t, is_active: res.is_active } : t)))
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  const getTotalPoints = () => {
    return selectedQuestions.reduce((total, qId) => {
      const question = questions.find((q) => q.id === qId)
      return total + (question?.points || 0)
    }, 0)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Tests</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTest ? "Edit Test" : "Create New Test"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Title</label>
                <Input
                  placeholder="Enter test title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea
                  placeholder="Enter test description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={subjectId || "__all__"} onValueChange={setSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10) || 60)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <span className="text-sm">{isActive ? "Active" : "Draft"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Select Questions ({selectedQuestions.length} selected, {getTotalPoints()} points)
                  </label>
                </div>
                <ScrollArea className="h-64 border rounded-md p-4">
                  {filteredQuestions.length > 0 ? (
                    <div className="space-y-2">
                      {filteredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => toggleQuestion(question.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2">{question.question_text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {question.subjects?.name && (
                                <Badge variant="secondary" className="text-xs">
                                  {question.subjects.name}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {question.points} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No questions available. Create questions first.
                    </p>
                  )}
                </ScrollArea>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || selectedQuestions.length === 0}
                >
                  {isLoading ? "Saving..." : editingTest ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {tests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{test.title}</p>
                      {test.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {test.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {test.subjects?.name ? (
                      <Badge variant="secondary">{test.subjects.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{test.test_questions.length}</TableCell>
                  <TableCell>{test.duration_minutes} min</TableCell>
                  <TableCell>
                    <Switch
                      checked={test.is_active}
                      onCheckedChange={() => handleToggleActive(test)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(test)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No tests yet. Create your first test to get started.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
