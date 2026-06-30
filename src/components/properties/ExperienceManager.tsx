import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Clock, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Experience } from '@/types/database';
import { toast } from 'sonner';

interface ExperienceManagerProps {
  propertyId: string;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  duration_hours: string;
  max_participants: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  duration_hours: '2',
  max_participants: '10',
};

function toFormState(exp: Experience): FormState {
  return {
    name: exp.name,
    description: exp.description ?? '',
    price: String(exp.price),
    duration_hours: String(exp.duration_hours),
    max_participants: String(exp.max_participants),
  };
}

export function ExperienceManager({ propertyId }: ExperienceManagerProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExperiences = useCallback(async () => {
    const { data } = await supabase
      .from('experiences')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });
    if (data) setExperiences(data as Experience[]);
    setIsLoading(false);
  }, [propertyId]);

  useEffect(() => { fetchExperiences(); }, [fetchExperiences]);

  function startAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(exp: Experience) {
    setEditingId(exp.id);
    setForm(toFormState(exp));
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Experience name is required.'); return; }
    const price = parseFloat(form.price);
    const duration = parseFloat(form.duration_hours);
    const maxP = parseInt(form.max_participants);
    if (isNaN(price) || price < 0) { toast.error('Enter a valid price.'); return; }
    if (isNaN(duration) || duration <= 0) { toast.error('Enter a valid duration.'); return; }
    if (isNaN(maxP) || maxP < 1) { toast.error('Enter a valid max participants.'); return; }

    setIsSaving(true);
    const payload = {
      property_id: propertyId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      duration_hours: duration,
      max_participants: maxP,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('experiences').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('experiences').insert({ ...payload, is_active: true }));
    }
    setIsSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Experience updated.' : 'Experience added.');
    cancelForm();
    fetchExperiences();
  }

  async function toggleActive(exp: Experience) {
    const { error } = await supabase
      .from('experiences')
      .update({ is_active: !exp.is_active })
      .eq('id', exp.id);
    if (error) { toast.error(error.message); return; }
    setExperiences((prev) =>
      prev.map((e) => (e.id === exp.id ? { ...e, is_active: !e.is_active } : e))
    );
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    setDeletingId(null);
    if (error) { toast.error(error.message); return; }
    toast.success('Experience deleted.');
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    if (editingId === id) cancelForm();
  }

  if (isLoading) {
    return <div className="space-y-3 animate-pulse">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Experience list */}
      {experiences.length === 0 && !showForm && (
        <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
          No experiences yet. Add your first one!
        </div>
      )}

      {experiences.map((exp) => (
        <Card key={exp.id} className={`transition-opacity ${!exp.is_active ? 'opacity-60' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{exp.name}</h4>
                  <Badge variant={exp.is_active ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {exp.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {exp.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{exp.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">₱{exp.price.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{exp.duration_hours}h</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />Up to {exp.max_participants}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleActive(exp)}
                  title={exp.is_active ? 'Deactivate' : 'Activate'}
                >
                  {exp.is_active
                    ? <ToggleRight className="h-4 w-4 text-primary" />
                    : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  }
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(exp)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={deletingId === exp.id}
                  onClick={() => handleDelete(exp.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Inline edit form */}
            {editingId === exp.id && showForm && (
              <ExperienceForm form={form} field={field} onSave={handleSave} onCancel={cancelForm} isSaving={isSaving} isEdit />
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add form */}
      {showForm && !editingId && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <ExperienceForm form={form} field={field} onSave={handleSave} onCancel={cancelForm} isSaving={isSaving} isEdit={false} />
          </CardContent>
        </Card>
      )}

      {/* Add button */}
      {!showForm && (
        <Button type="button" variant="outline" className="w-full gap-2" onClick={startAdd}>
          <Plus className="h-4 w-4" />
          Add experience
        </Button>
      )}
    </div>
  );
}

function ExperienceForm({
  form,
  field,
  onSave,
  onCancel,
  isSaving,
  isEdit,
}: {
  form: FormState;
  field: (key: keyof FormState) => { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void };
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      <p className="text-sm font-semibold">{isEdit ? 'Edit experience' : 'New experience'}</p>
      <div className="grid gap-4">
        <div>
          <Label className="text-xs mb-1.5 block">Name *</Label>
          <Input placeholder="e.g. Mango Harvest Tour" className="h-9 text-sm" {...field('name')} />
        </div>
        <div>
          <Label className="text-xs mb-1.5 block">Description</Label>
          <Textarea placeholder="What guests will do and experience..." className="text-sm resize-none min-h-[72px]" {...field('description')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs mb-1.5 block">Price (₱) *</Label>
            <Input type="number" min="0" placeholder="500" className="h-9 text-sm" {...field('price')} />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Duration (hrs) *</Label>
            <Input type="number" min="0.5" step="0.5" placeholder="2" className="h-9 text-sm" {...field('duration_hours')} />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Max guests *</Label>
            <Input type="number" min="1" placeholder="10" className="h-9 text-sm" {...field('max_participants')} />
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving…' : isEdit ? 'Update' : 'Add experience'}
        </Button>
      </div>
    </div>
  );
}
