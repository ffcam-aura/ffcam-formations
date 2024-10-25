// app/notifications/preferences-form.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type Discipline = {
  id: string;
  label: string;
};

interface PreferencesFormProps {
  initialDisciplines: Discipline[];
}

export default function PreferencesForm({ initialDisciplines }: PreferencesFormProps) {
  const { user } = useUser();
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les préférences de l'utilisateur
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
    setSelectedDisciplines(prev => {
      if (prev.includes(disciplineId)) {
        return prev.filter(id => id !== disciplineId);
      }
      return [...prev, disciplineId];
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Sélectionnez les disciplines pour lesquelles vous souhaitez recevoir des notifications 
              lorsque de nouvelles formations sont publiées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {initialDisciplines.map((discipline) => (
                <div key={discipline.id} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id={discipline.id}
                    checked={selectedDisciplines.includes(discipline.id)}
                    onCheckedChange={() => handleDisciplineToggle(discipline.id)}
                  />
                  <div className="space-y-1">
                    <Label 
                      htmlFor={discipline.id}
                      className="text-base font-medium cursor-pointer"
                    >
                      {discipline.label}
                    </Label>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-6">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}