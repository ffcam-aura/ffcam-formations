"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { InfoIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Discipline = {
  id: string;
  label: string;
};

interface NotificationsFormProps {
  initialDisciplines: Discipline[];
}

export default function NotificationsForm({ initialDisciplines }: NotificationsFormProps) {
  const { user } = useUser();
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setSelectedDisciplines(data);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos préférences",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleDisciplineToggle = (disciplineId: string) => {
    setSelectedDisciplines(prev =>
      prev.includes(disciplineId)
        ? prev.filter(id => id !== disciplineId)
        : [...prev, disciplineId]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disciplines: selectedDisciplines }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      toast({
        title: "Succès",
        description: "Vos préférences ont été enregistrées",
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos préférences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDisciplines = initialDisciplines.filter(discipline =>
    discipline.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              La notification des nouvelles formations est actuellement en version bêta jusqu&apos;à fin octobre 2024.
              Pendant cette phase de test, vous pourriez recevoir quelques notifications de test pour nous aider à valider le système.
              Nous vous remercions de votre compréhension et de votre participation à l&apos;amélioration de ce service.
            </AlertDescription>
          </Alert>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Sélectionnez les disciplines pour lesquelles vous souhaitez recevoir des notifications.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une discipline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredDisciplines.map((discipline) => (
              <div
                key={discipline.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={discipline.id}
                  checked={selectedDisciplines.includes(discipline.id)}
                  onCheckedChange={() => handleDisciplineToggle(discipline.id)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor={discipline.id}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {discipline.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}