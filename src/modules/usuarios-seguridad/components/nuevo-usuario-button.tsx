'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import type { RolMini } from '../types';
import { UsuarioFormDialog } from './usuario-form-dialog';

interface NuevoUsuarioButtonProps {
  roles: RolMini[];
}

export function NuevoUsuarioButton({ roles }: NuevoUsuarioButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Nuevo usuario
      </Button>
      <UsuarioFormDialog open={open} onOpenChange={setOpen} roles={roles} />
    </>
  );
}
