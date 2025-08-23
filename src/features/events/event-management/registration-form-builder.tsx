'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  Settings,
  Text,
  FileText,
  CheckSquare,
  ToggleLeft,
  List,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

interface FormField {
  id: string;
  type:
    | 'text'
    | 'textarea'
    | 'email'
    | 'phone'
    | 'number'
    | 'date'
    | 'location'
    | 'checkbox'
    | 'toggle'
    | 'radio'
    | 'select'
    | 'poll'
    | 'rating';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface RegistrationFormBuilderProps {
  eventId: string;
}

const defaultFields: FormField[] = [
  {
    id: 'name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email address',
    required: true,
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone Number',
    placeholder: 'Enter your phone number',
    required: false,
  },
];

const fieldTypes = [
  { value: 'text', label: 'Short Text', icon: Text },
  { value: 'textarea', label: 'Long Text', icon: FileText },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'number', label: 'Number', icon: Text },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'location', label: 'Location', icon: MapPin },
  { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { value: 'toggle', label: 'Toggle', icon: ToggleLeft },
  { value: 'radio', label: 'Multiple Choice', icon: List },
  { value: 'select', label: 'Dropdown', icon: List },
  { value: 'poll', label: 'Poll', icon: Star },
  { value: 'rating', label: 'Rating', icon: Star },
];

export function RegistrationFormBuilder({
  eventId,
}: RegistrationFormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Event-specific data that would be fetched using eventId
  const eventTitle = 'ETHIndia 2025'; // Would be fetched using eventId
  const currentFieldCount = fields.length;

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      options:
        type === 'radio' || type === 'select' || type === 'poll'
          ? ['Option 1', 'Option 2']
          : undefined,
    };

    setFields([...fields, newField]);
    setEditingField(newField);
    toast.success('Field added successfully');
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(
      fields.map(field => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
    if (editingField?.id === id) {
      setEditingField(null);
    }
    toast.success('Field removed');
  };

  const duplicateField = (field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (Copy)`,
    };
    setFields([...fields, duplicatedField]);
    toast.success('Field duplicated');
  };

  const saveForm = () => {
    toast.success('Registration form saved successfully!');
  };

  const renderFieldEditor = (field: FormField) => {
    return (
      <Card className='mb-4'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg'>Edit Field</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='field-label'>Field Label</Label>
              <Input
                id='field-label'
                value={field.label}
                onChange={e => updateField(field.id, { label: e.target.value })}
                placeholder='Enter field label'
              />
            </div>
            <div>
              <Label htmlFor='field-placeholder'>Placeholder</Label>
              <Input
                id='field-placeholder'
                value={field.placeholder || ''}
                onChange={e =>
                  updateField(field.id, { placeholder: e.target.value })
                }
                placeholder='Enter placeholder text'
              />
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Switch
              id='required'
              checked={field.required}
              onCheckedChange={checked =>
                updateField(field.id, { required: checked })
              }
            />
            <Label htmlFor='required'>Required field</Label>
          </div>

          {(field.type === 'radio' ||
            field.type === 'select' ||
            field.type === 'poll') && (
            <div>
              <Label>Options</Label>
              <div className='space-y-2'>
                {field.options?.map((option, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Input
                      value={option}
                      onChange={e => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = e.target.value;
                        updateField(field.id, { options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const newOptions = field.options?.filter(
                          (_, i) => i !== index
                        );
                        updateField(field.id, { options: newOptions });
                      }}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                ))}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    const newOptions = [
                      ...(field.options || []),
                      `Option ${(field.options?.length || 0) + 1}`,
                    ];
                    updateField(field.id, { options: newOptions });
                  }}
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderFieldPreview = (field: FormField) => {
    const renderInput = () => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
          return (
            <Input
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
            />
          );
        case 'textarea':
          return (
            <Textarea
              placeholder={field.placeholder}
              required={field.required}
            />
          );
        case 'date':
          return <Input type='date' required={field.required} />;
        case 'location':
          return (
            <Input placeholder='Enter location' required={field.required} />
          );
        case 'checkbox':
          return (
            <div className='flex items-center space-x-2'>
              <Checkbox id={field.id} required={field.required} />
              <Label htmlFor={field.id}>{field.label}</Label>
            </div>
          );
        case 'toggle':
          return (
            <div className='flex items-center space-x-2'>
              <Switch id={field.id} required={field.required} />
              <Label htmlFor={field.id}>{field.label}</Label>
            </div>
          );
        case 'radio':
          return (
            <RadioGroup required={field.required}>
              {field.options?.map((option, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <RadioGroupItem value={option} id={`${field.id}_${index}`} />
                  <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          );
        case 'select':
          return (
            <Select required={field.required}>
              <SelectTrigger>
                <SelectValue placeholder='Select an option' />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'poll':
          return (
            <div className='space-y-2'>
              {field.options?.map((option, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <RadioGroupItem value={option} id={`${field.id}_${index}`} />
                  <Label htmlFor={`${field.id}_${index}`}>{option}</Label>
                </div>
              ))}
            </div>
          );
        case 'rating':
          return (
            <div className='flex items-center space-x-1'>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type='button'
                  className='text-2xl text-muted-foreground hover:text-yellow-400 transition-colors'
                >
                  ★
                </button>
              ))}
            </div>
          );
        default:
          return <Input placeholder='Field preview' />;
      }
    };

    return (
      <div className='space-y-2'>
        <Label className='flex items-center gap-2'>
          {field.label}
          {field.required && <span className='text-destructive'>*</span>}
        </Label>
        {renderInput()}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='font-primary text-xl font-bold text-foreground'>
            {eventTitle} - Registration Form Builder
          </h2>
          <p className='font-secondary text-sm text-muted-foreground'>
            Customize your registration form with custom questions and fields
            (Event ID: {eventId}) - {currentFieldCount} fields configured
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            onClick={() => setPreviewMode(!previewMode)}
            className='gap-2'
          >
            {previewMode ? (
              <Settings className='w-4 h-4' />
            ) : (
              <Eye className='w-4 h-4' />
            )}
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button onClick={saveForm} className='gap-2'>
            Save Form
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Form Builder */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Form Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {fields.map(field => (
                  <div
                    key={field.id}
                    className='border rounded-lg p-4 hover:bg-muted/20 transition-colors'
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>{field.type}</Badge>
                        {field.required && (
                          <Badge variant='destructive'>Required</Badge>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            setEditingField(
                              editingField?.id === field.id ? null : field
                            )
                          }
                        >
                          <Settings className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => duplicateField(field)}
                        >
                          <Copy className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deleteField(field.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className='font-medium'>{field.label}</h4>
                      {field.placeholder && (
                        <p className='text-sm text-muted-foreground'>
                          {field.placeholder}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className='my-6' />

              <div>
                <h4 className='font-medium mb-3'>Add New Field</h4>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                  {fieldTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          addField(type.value as FormField['type'])
                        }
                        className='h-auto p-3 flex flex-col items-center gap-2'
                      >
                        <Icon className='w-4 h-4' />
                        <span className='text-xs'>{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {editingField && renderFieldEditor(editingField)}
        </div>

        {/* Form Preview */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Form Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {fields.map(field => (
                  <div key={field.id}>{renderFieldPreview(field)}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
