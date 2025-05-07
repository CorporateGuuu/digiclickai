import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample data for initial state
const initialData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Take out the garbage', priority: 'medium' },
    'task-2': { id: 'task-2', content: 'Watch my favorite show', priority: 'low' },
    'task-3': { id: 'task-3', content: 'Charge my phone', priority: 'high' },
    'task-4': { id: 'task-4', content: 'Cook dinner', priority: 'medium' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To do',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    },
    'column-2': {
      id: 'column-2',
      title: 'In progress',
      taskIds: [],
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: [],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

function KanbanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [addingToColumn, setAddingToColumn] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/kanban');
    }
  }, [status, router]);

  // Fetch board data
  useEffect(() => {
    async function fetchBoardData() {
      if (!session?.user?.id) return;

      try {
        // Fetch columns
        const { data: columnsData, error: columnsError } = await supabase
          .from('kanban_columns')
          .select('*')
          .eq('user_id', session.user.id)
          .order('position');
        
        if (columnsError) throw columnsError;
        
        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('kanban_tasks')
          .select('*')
          .eq('user_id', session.user.id);
        
        if (tasksError) throw tasksError;
        
        if (columnsData.length > 0 && tasksData) {
          // Transform data to match our state structure
          const tasks = {};
          tasksData.forEach(task => {
            tasks[task.id] = {
              id: task.id,
              content: task.content,
              priority: task.priority
            };
          });
          
          const columns = {};
          const columnOrder = [];
          
          columnsData.forEach(column => {
            columns[column.id] = {
              id: column.id,
              title: column.title,
              taskIds: column.task_ids || []
            };
            columnOrder.push(column.id);
          });
          
          setState({ tasks, columns, columnOrder });
        }
      } catch (error) {
        console.error('Error fetching board data:', error);
        // Use initial data if there's an error
        setState(initialData);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchBoardData();
    } else {
      setLoading(false);
    }
  }, [session]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    // If there's no destination or the item was dropped back to its original position
    if (!destination || (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )) {
      return;
    }

    // If we're dragging columns
    if (type === 'column') {
      const newColumnOrder = Array.from(state.columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...state,
        columnOrder: newColumnOrder,
      };
      
      setState(newState);
      
      // Update in database
      try {
        // Update column positions in database
        for (let i = 0; i < newColumnOrder.length; i++) {
          await supabase
            .from('kanban_columns')
            .update({ position: i })
            .eq('id', newColumnOrder[i]);
        }
      } catch (error) {
        console.error('Error updating column positions:', error);
      }
      
      return;
    }

    // Moving tasks
    const startColumn = state.columns[source.droppableId];
    const finishColumn = state.columns[destination.droppableId];

    // If moving within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds,
      };

      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      };

      setState(newState);
      
      // Update in database
      try {
        await supabase
          .from('kanban_columns')
          .update({ task_ids: newTaskIds })
          .eq('id', startColumn.id);
      } catch (error) {
        console.error('Error updating task order:', error);
      }
      
      return;
    }

    // Moving from one column to another
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStartColumn = {
      ...startColumn,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinishColumn = {
      ...finishColumn,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    };

    setState(newState);
    
    // Update in database
    try {
      await supabase
        .from('kanban_columns')
        .update({ task_ids: startTaskIds })
        .eq('id', startColumn.id);
        
      await supabase
        .from('kanban_columns')
        .update({ task_ids: finishTaskIds })
        .eq('id', finishColumn.id);
    } catch (error) {
      console.error('Error updating task columns:', error);
    }
  };

  const addNewTask = async (columnId) => {
    if (!newTaskContent.trim()) return;
    
    // Generate a new task ID
    const taskId = `task-${Date.now()}`;
    
    // Create new task
    const newTask = {
      id: taskId,
      content: newTaskContent,
      priority: newTaskPriority
    };
    
    // Add task to column
    const column = state.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(taskId);
    
    const newColumn = {
      ...column,
      taskIds: newTaskIds
    };
    
    // Update state
    const newState = {
      ...state,
      tasks: {
        ...state.tasks,
        [taskId]: newTask
      },
      columns: {
        ...state.columns,
        [columnId]: newColumn
      }
    };
    
    setState(newState);
    setNewTaskContent('');
    setNewTaskPriority('medium');
    setAddingToColumn(null);
    
    // Save to database
    try {
      // Save task
      await supabase
        .from('kanban_tasks')
        .insert([{
          id: taskId,
          content: newTaskContent,
          priority: newTaskPriority,
          user_id: session.user.id
        }]);
      
      // Update column task IDs
      await supabase
        .from('kanban_columns')
        .update({ task_ids: newTaskIds })
        .eq('id', columnId);
    } catch (error) {
      console.error('Error adding new task:', error);
    }
  };

  const deleteTask = async (taskId, columnId) => {
    // Remove task from column
    const column = state.columns[columnId];
    const newTaskIds = column.taskIds.filter(id => id !== taskId);
    
    const newColumn = {
      ...column,
      taskIds: newTaskIds
    };
    
    // Create new tasks object without the deleted task
    const newTasks = { ...state.tasks };
    delete newTasks[taskId];
    
    // Update state
    const newState = {
      ...state,
      tasks: newTasks,
      columns: {
        ...state.columns,
        [columnId]: newColumn
      }
    };
    
    setState(newState);
    
    // Delete from database
    try {
      await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);
      
      await supabase
        .from('kanban_columns')
        .update({ task_ids: newTaskIds })
        .eq('id', columnId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addNewColumn = async () => {
    // Generate a new column ID
    const columnId = `column-${Date.now()}`;
    
    // Create new column
    const newColumn = {
      id: columnId,
      title: 'New Column',
      taskIds: []
    };
    
    // Add to column order
    const newColumnOrder = Array.from(state.columnOrder);
    newColumnOrder.push(columnId);
    
    // Update state
    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [columnId]: newColumn
      },
      columnOrder: newColumnOrder
    };
    
    setState(newState);
    
    // Save to database
    try {
      await supabase
        .from('kanban_columns')
        .insert([{
          id: columnId,
          title: 'New Column',
          task_ids: [],
          position: newColumnOrder.length - 1,
          user_id: session.user.id
        }]);
    } catch (error) {
      console.error('Error adding new column:', error);
    }
  };

  const updateColumnTitle = async (columnId, newTitle) => {
    if (!newTitle.trim()) return;
    
    // Update column
    const column = state.columns[columnId];
    const updatedColumn = {
      ...column,
      title: newTitle
    };
    
    // Update state
    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [columnId]: updatedColumn
      }
    };
    
    setState(newState);
    
    // Update in database
    try {
      await supabase
        .from('kanban_columns')
        .update({ title: newTitle })
        .eq('id', columnId);
    } catch (error) {
      console.error('Error updating column title:', error);
    }
  };

  const deleteColumn = async (columnId) => {
    // Get all task IDs in this column
    const taskIds = state.columns[columnId].taskIds;
    
    // Create new columns object without the deleted column
    const newColumns = { ...state.columns };
    delete newColumns[columnId];
    
    // Create new tasks object without the tasks from the deleted column
    const newTasks = { ...state.tasks };
    taskIds.forEach(taskId => {
      delete newTasks[taskId];
    });
    
    // Remove column from column order
    const newColumnOrder = state.columnOrder.filter(id => id !== columnId);
    
    // Update state
    const newState = {
      tasks: newTasks,
      columns: newColumns,
      columnOrder: newColumnOrder
    };
    
    setState(newState);
    
    // Delete from database
    try {
      // Delete column
      await supabase
        .from('kanban_columns')
        .delete()
        .eq('id', columnId);
      
      // Delete all tasks in the column
      for (const taskId of taskIds) {
        await supabase
          .from('kanban_tasks')
          .delete()
          .eq('id', taskId);
      }
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout title="Kanban Board | MDTS">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
            <p className="ml-4">Loading board...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Layout title="Kanban Board | MDTS">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please sign in to access the Kanban board.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Kanban Board | MDTS">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Project Management Board</h1>
          <button
            onClick={addNewColumn}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Column
          </button>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex overflow-x-auto pb-4 space-x-4"
                style={{ minHeight: '500px' }}
              >
                {state.columnOrder.map((columnId, index) => {
                  const column = state.columns[columnId];
                  const tasks = column.taskIds.map(taskId => state.tasks[taskId]);
                  
                  return (
                    <Draggable key={column.id} draggableId={column.id} index={index}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          className="bg-gray-100 rounded-lg w-80 flex-shrink-0"
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="p-4 font-semibold bg-gray-200 rounded-t-lg flex justify-between items-center"
                          >
                            <input
                              type="text"
                              value={column.title}
                              onChange={(e) => updateColumnTitle(column.id, e.target.value)}
                              className="bg-transparent border-b border-transparent hover:border-gray-400 focus:border-blue-500 focus:outline-none px-1"
                            />
                            <button
                              onClick={() => deleteColumn(column.id)}
                              className="text-red-500 hover:text-red-700 focus:outline-none"
                            >
                              ×
                            </button>
                          </div>
                          
                          <Droppable droppableId={column.id} type="task">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`p-4 min-h-[400px] ${
                                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                }`}
                              >
                                {tasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                        className={`p-3 mb-3 rounded shadow-sm ${
                                          snapshot.isDragging ? 'bg-blue-100' : 'bg-white'
                                        } ${
                                          task.priority === 'high' 
                                            ? 'border-l-4 border-red-500' 
                                            : task.priority === 'medium'
                                              ? 'border-l-4 border-yellow-500'
                                              : 'border-l-4 border-green-500'
                                        }`}
                                      >
                                        <div className="flex justify-between">
                                          <p>{task.content}</p>
                                          <button
                                            onClick={() => deleteTask(task.id, column.id)}
                                            className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                
                                {addingToColumn === column.id ? (
                                  <div className="mt-4 p-3 bg-white rounded shadow-sm">
                                    <textarea
                                      value={newTaskContent}
                                      onChange={(e) => setNewTaskContent(e.target.value)}
                                      placeholder="Enter task description..."
                                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                      rows="3"
                                    />
                                    <div className="flex mb-2">
                                      <label className="mr-2">Priority:</label>
                                      <select
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(e.target.value)}
                                        className="border rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                      </select>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => setAddingToColumn(null)}
                                        className="px-3 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => addNewTask(column.id)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAddingToColumn(column.id)}
                                    className="w-full mt-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded text-center focus:outline-none"
                                  >
                                    + Add Task
                                  </button>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Layout>
  );
}

export default KanbanPage;
