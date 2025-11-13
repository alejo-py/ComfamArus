import { useEffect, useMemo, useState } from "react";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
};

type TodoListProps = {
  storageKey?: string;
  title?: string;
  showHeader?: boolean;
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const TodoList = ({
  storageKey = "todo-list",
  title = "TodoList",
  showHeader = true,
}: TodoListProps) => {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as TodoItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch (_) {
      // Ignorar errores de parseo
    }
  }, [storageKey]);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (_) {
      // Ignorar storage full
    }
  }, [items, storageKey]);

  const remaining = useMemo(
    () => items.filter((i) => !i.completed).length,
    [items]
  );

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    const next: TodoItem = {
      id: generateId(),
      text: trimmed,
      completed: false,
    };
    setItems([next, ...items]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i))
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCompleted = () => {
    setItems((prev) => prev.filter((i) => !i.completed));
  };

  return (
    <section className="w-full max-w-2xl mx-auto">
      {showHeader && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-comfama to-pink-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {remaining} {remaining === 1 ? "pendiente" : "pendientes"}
            </span>
            {items.length > 0 && (
              <span className="text-xs text-gray-400">
                ({items.length} {items.length === 1 ? "tarea" : "tareas"})
              </span>
            )}
          </div>
        </div>
      )}

      <div
        className="flex gap-3 mb-6"
        role="group"
        aria-label="Agregar pendiente"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué necesitas hacer?"
          aria-label="Nueva tarea"
          className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-3 text-black placeholder-gray-400 
                     focus:outline-none focus:border-comfama focus:ring-2 focus:ring-comfama/20 
                     transition-all duration-200 shadow-sm hover:border-gray-300 
                     bg-white font-medium"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-comfama to-pink-600 text-white 
                     font-semibold hover:scale-105 hover:shadow-lg active:scale-95 
                     transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:scale-100"
          aria-label="Agregar tarea"
          disabled={!input.trim()}
        >
          Agregar
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 font-medium">No hay tareas aún</p>
          <p className="text-sm text-gray-400 mt-1">
            Agrega una nueva tarea para comenzar
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-3 rounded-xl border-2 border-gray-200 
                           p-4 bg-white shadow-sm hover:shadow-md hover:border-comfama/30 
                           transition-all duration-200"
              >
                <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggle(item.id)}
                      aria-label={`Marcar ${item.text}`}
                      className="w-5 h-5 rounded border-2 border-gray-300 
                                 checked:bg-comfama checked:border-comfama
                                 cursor-pointer appearance-none transition-all duration-200
                                 hover:border-comfama focus:outline-none focus:ring-2 
                                 focus:ring-comfama/20"
                      style={{
                        backgroundImage: item.completed
                          ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E")`
                          : "none",
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  </div>
                  <span
                    className={`flex-1 text-base font-medium transition-all duration-200 ${
                      item.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800"
                    }`}
                  >
                    {item.text}
                  </span>
                </label>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium
                             text-gray-500 hover:text-white hover:bg-red-500 
                             transition-all duration-200 opacity-0 group-hover:opacity-100
                             active:scale-95"
                  aria-label={`Eliminar ${item.text}`}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          {items.some((i) => i.completed) && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleClearCompleted}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium
                           text-gray-600 hover:text-white hover:bg-gradient-to-r 
                           hover:from-comfama hover:to-pink-600
                           transition-all duration-200 border border-gray-300 
                           hover:border-transparent"
              >
                Limpiar tareas completadas
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default TodoList;


