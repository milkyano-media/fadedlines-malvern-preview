import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Edit,
  Trash2,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  Parameter,
  ParameterType,
  ParameterCategory,
  CreateParameterRequest,
} from '@/interfaces/ParameterInterface';
import {
  getAllParameters,
  createParameter,
  updateParameter,
  deleteParameter,
  toggleParameterStatus,
  getParametersByCategory,
} from '@/utils/parameterApi';

// Validation schema for parameter form
const parameterSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .regex(/^[a-z0-9_.]+$/, 'Key must contain only lowercase letters, numbers, dots, and underscores'),
  value: z.string().min(1, 'Value is required'),
  type: z.nativeEnum(ParameterType),
  category: z.nativeEnum(ParameterCategory),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type ParameterFormData = z.infer<typeof parameterSchema>;

export default function ParameterManagement() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ParameterCategory | 'all'>('all');
  const { toast } = useToast();

  const form = useForm<ParameterFormData>({
    resolver: zodResolver(parameterSchema),
    defaultValues: {
      key: '',
      value: '',
      type: ParameterType.STRING,
      category: ParameterCategory.CONTENT,
      description: '',
      is_active: true,
    },
  });

  // Fetch parameters on mount
  useEffect(() => {
    fetchParameters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const fetchParameters = async () => {
    try {
      setIsLoading(true);
      const response =
        filterCategory === 'all'
          ? await getAllParameters()
          : await getParametersByCategory(filterCategory as ParameterCategory);
      setParameters(response.parameters);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch parameters',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ParameterFormData) => {
    try {
      setIsLoading(true);

      // Parse value based on type
      let parsedValue: string | number | boolean | object = data.value;
      if (data.type === ParameterType.NUMBER) {
        parsedValue = parseFloat(data.value);
      } else if (data.type === ParameterType.BOOLEAN) {
        parsedValue = data.value === 'true' || data.value === '1';
      } else if (data.type === ParameterType.JSON) {
        parsedValue = JSON.parse(data.value);
      }

      const requestData: CreateParameterRequest = {
        key: data.key,
        value: parsedValue,
        type: data.type,
        category: data.category,
        description: data.description,
        is_active: data.is_active,
      };

      if (editingParameter) {
        await updateParameter(editingParameter.id, requestData);
        toast({
          title: 'Success',
          description: 'Parameter updated successfully',
        });
      } else {
        await createParameter(requestData);
        toast({
          title: 'Success',
          description: 'Parameter created successfully',
        });
      }

      setIsDialogOpen(false);
      form.reset();
      setEditingParameter(null);
      fetchParameters();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save parameter',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (parameter: Parameter) => {
    setEditingParameter(parameter);
    form.reset({
      key: parameter.key,
      value: typeof parameter.value === 'object'
        ? JSON.stringify(parameter.value, null, 2)
        : String(parameter.value),
      type: parameter.type,
      category: parameter.category,
      description: parameter.description || '',
      is_active: parameter.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (parameterId: string) => {
    if (!confirm('Are you sure you want to delete this parameter?')) return;

    try {
      await deleteParameter(parameterId);
      toast({
        title: 'Success',
        description: 'Parameter deleted successfully',
      });
      fetchParameters();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete parameter',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (parameterId: string, currentStatus: boolean) => {
    try {
      await toggleParameterStatus(parameterId, !currentStatus);
      toast({
        title: 'Success',
        description: 'Parameter status updated successfully',
      });
      fetchParameters();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingParameter(null);
    form.reset();
  };

  const filteredParameters = parameters.filter((param) =>
    param.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    param.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: ParameterCategory) => {
    const colors: Record<ParameterCategory, string> = {
      [ParameterCategory.THEME]: 'bg-purple-500/10 text-purple-500',
      [ParameterCategory.BRANDING]: 'bg-blue-500/10 text-blue-500',
      [ParameterCategory.LAYOUT]: 'bg-green-500/10 text-green-500',
      [ParameterCategory.CONTENT]: 'bg-yellow-500/10 text-yellow-500',
      [ParameterCategory.FEATURE_FLAG]: 'bg-red-500/10 text-red-500',
      [ParameterCategory.SEO]: 'bg-indigo-500/10 text-indigo-500',
      [ParameterCategory.ANALYTICS]: 'bg-pink-500/10 text-pink-500',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500';
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Parameter Management</h1>
              <p className="text-gray-400">
                Manage dynamic website appearance and behavior
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchParameters}
              className="border-stone-800 hover:bg-stone-900"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogContent className="bg-[#0a0a0a] border-stone-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingParameter ? 'Edit Parameter' : 'Create New Parameter'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingParameter
                      ? 'Update the parameter details below'
                      : 'Add a new parameter to control website appearance'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., theme.primary_color"
                              className="bg-stone-900 border-stone-800"
                              disabled={!!editingParameter}
                            />
                          </FormControl>
                          <FormDescription>
                            Unique identifier (lowercase, dots, underscores only)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-stone-900 border-stone-800">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-stone-900 border-stone-800">
                                {Object.values(ParameterType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-stone-900 border-stone-800">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-stone-900 border-stone-800">
                                {Object.values(ParameterCategory).map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter value"
                              className="bg-stone-900 border-stone-800 min-h-[80px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter value according to the selected type
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Describe this parameter"
                              className="bg-stone-900 border-stone-800"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-stone-800 p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Enable this parameter for use on the website
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDialogClose}
                        className="border-stone-800"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        {isLoading ? 'Saving...' : editingParameter ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-[#0a0a0a] border-stone-800">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search parameters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-stone-900 border-stone-800"
                />
              </div>
              <Select
                value={filterCategory}
                onValueChange={(value: string) => setFilterCategory(value as ParameterCategory | 'all')}
              >
                <SelectTrigger className="w-48 bg-stone-900 border-stone-800">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.values(ParameterCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Parameters Table */}
        <Card className="bg-[#0a0a0a] border-stone-800">
          <CardHeader>
            <CardTitle>Parameters ({filteredParameters.length})</CardTitle>
            <CardDescription>
              Manage all parameters that control your website's appearance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading parameters...</div>
            ) : filteredParameters.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No parameters found. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-800 hover:bg-stone-900/50">
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParameters.map((parameter) => (
                    <TableRow
                      key={parameter.id}
                      className="border-stone-800 hover:bg-stone-900/50"
                    >
                      <TableCell className="font-mono text-sm">
                        {parameter.key}
                        {parameter.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {parameter.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {typeof parameter.value === 'object'
                          ? JSON.stringify(parameter.value)
                          : String(parameter.value)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-stone-700">
                          {parameter.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(parameter.category)}>
                          {parameter.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={parameter.is_active}
                          onCheckedChange={() =>
                            handleToggleStatus(parameter.id, parameter.is_active)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(parameter)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(parameter.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
