import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Play, Save, Eye, Undo2, Redo2 } from 'lucide-react';

export default function EditorToolbar({ onRun, onSave, onPreview, onUndo, onRedo }: any) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-center gap-2 bg-white dark:bg-gray-900 shadow-xl rounded-md px-3 py-4 border dark:border-gray-700 w-14">
      <Button size="icon" variant="ghost" onClick={onRun} title="Run">
        <Play className="w-5 h-5" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onPreview} title="Preview">
        <Eye className="w-5 h-5" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onSave} title="Save">
        <Save className="w-5 h-5" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onUndo} title="Undo">
        <Undo2 className="w-5 h-5" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onRedo} title="Redo">
        <Redo2 className="w-5 h-5" />
      </Button>
      <div className="border-t w-full my-1 dark:border-gray-700" />
      <Button size="icon" variant="ghost" onClick={toggleDarkMode} title="Toggle Dark Mode">
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  );
}
