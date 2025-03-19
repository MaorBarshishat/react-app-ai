import React, { useState, useRef, useEffect } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaPlus, FaEllipsisH, FaChevronRight, FaChevronDown, FaBars } from 'react-icons/fa';
import './FolderSidebar.css';

// Define interfaces for the folder structure
export interface InvestigationFolder {
  id: string;
  name: string;
  type: 'folder';
  children: (InvestigationFolder | InvestigationFile)[];
  isOpen?: boolean;
}

export interface InvestigationFile {
  id: string;
  name: string;
  type: 'file';
  status?: 'open' | 'closed' | 'in-progress';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  dateCreated?: string;
  dates?: (string | { startDate: string; endDate: string })[];
  assets?: string[];
  domains?: string[];
  description?: string;
  assignedTo?: string;
}

export type InvestigationItem = InvestigationFolder | InvestigationFile;

interface FolderSidebarProps {
  folders: {
    id: string;
    name: string;
    type: string;
    expanded: boolean;
    files: {
      id: string;
      name: string;
      type: string;
      expanded: boolean;
    }[];
  }[];
  onFolderClick: (folderId: string) => void;
  onFileClick: (fileId: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  activeFile: string | null;
  selectedItem: InvestigationItem | null;
  onSelectItem: (item: InvestigationItem) => void;
  onToggleFolder: (folderId: string) => void;
  onAddItem?: (parentId: string | null, itemType: 'folder' | 'file') => void;
  onRenameItem?: (itemId: string, newName: string) => void;
  onDeleteItem?: (itemId: string) => void;
  sidebarWidth?: number;
  onWidthChange?: (newWidth: number) => void;
  className?: string;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({
  folders,
  onFolderClick,
  onFileClick,
  isOpen,
  toggleSidebar,
  activeFile,
  selectedItem,
  onSelectItem,
  onToggleFolder,
  onAddItem,
  onRenameItem,
  onDeleteItem,
  sidebarWidth = 25,
  onWidthChange,
  className = ''
}) => {
  const [showFolderMenu, setShowFolderMenu] = useState<{show: boolean, folderId?: string}>({show: false});
  const [showFileMenu, setShowFileMenu] = useState<{show: boolean, fileId?: string}>({show: false});
  const [showNewItemMenu, setShowNewItemMenu] = useState<{show: boolean, parentId?: string}>({show: false});
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Handle resizing sidebar
  const handleMouseMove = (e: MouseEvent) => {
    if (!onWidthChange) return;
    
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth >= 15 && newWidth <= 85) { // Constraints for sidebar width
      onWidthChange(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Effect to handle clicks outside menus
  useEffect(() => {
    const handleClickOutside = () => {
      if (showFolderMenu.show && showFileMenu.show && showNewItemMenu.show) {
        setShowFolderMenu({ show: false });
        setShowFileMenu({ show: false });
        setShowNewItemMenu({ show: false });
        setOverlayVisible(false);
      }
    };
    
    if (showFolderMenu.show || showFileMenu.show || showNewItemMenu.show) {
      document.addEventListener('mousedown', handleClickOutside);
      setOverlayVisible(true);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFolderMenu.show, showFileMenu.show, showNewItemMenu.show]);

  // Handle folder actions (ellipsis menu)
  const handleFolderActions = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    
    // Close any other open menus
    setShowFileMenu({ show: false });
    setShowNewItemMenu({ show: false });
    
    // Toggle menu for this folder
    setShowFolderMenu({
      show: !showFolderMenu.show || showFolderMenu.folderId !== folderId,
      folderId
    });
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const temp = document.getElementsByClassName('folder-sidebar')[0].getBoundingClientRect();
    // Position the menu below the button
    setMenuPosition({
      top: rect.top + rect.height - temp.top , // 5px below the button
      left: rect.left - 100 // Aligned to right of button but adjusted left
    });
    
    setOverlayVisible(true);
  };

  // Handle file actions (ellipsis menu)
  const handleFileActions = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close other menus
    setShowFolderMenu({ show: false });
    setShowNewItemMenu({ show: false });
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setShowFileMenu({
      show: !showFileMenu.show || showFileMenu.fileId !== fileId,
      fileId
    });
    const temp = document.getElementsByClassName('folder-sidebar')[0].getBoundingClientRect();
    // Position the menu below the button
    setMenuPosition({
      top: rect.top + rect.height - temp.top , // 5px below the button
      left: rect.left - 100 // Aligned to right of button but adjusted left
    });
    
    setOverlayVisible(true);
  };

  // Function to start renaming a folder
  const startRenaming = (e: React.MouseEvent, folderId: string, folderName: string) => {
    e.stopPropagation();
    setRenamingFolder(folderId);
    setNewFolderName(folderName);
    setShowFolderMenu({ show: false });
    setOverlayVisible(false);
  };

  // Function to cancel renaming
  const cancelRenaming = () => {
    setRenamingFolder(null);
    setNewFolderName('');
  };

  // Function to finish renaming
  const finishRenaming = () => {
    if (!renamingFolder || !newFolderName.trim() || !onRenameItem) {
      cancelRenaming();
      return;
    }

    onRenameItem(renamingFolder, newFolderName.trim());
    cancelRenaming();
  };

  // Render folder structure recursively
  const renderFolderStructure = (items: (InvestigationFolder | InvestigationFile)[], level = 0) => {
    return items.map(item => {
      if (item.type === 'folder') {
        const folder = item as InvestigationFolder;
        return (
          <div key={folder.id} style={{ marginLeft: `${level * 20}px` }}>
            <div 
              className={`folder-item ${selectedItem?.id === folder.id ? 'selected' : ''}`}
              onClick={() => onToggleFolder(folder.id)}
            >
              <div className="folder-content">
                <span className="folder-icon">
                  {folder.isOpen ? <FaFolderOpen /> : <FaFolder />}
                </span>
                
                {renamingFolder === folder.id ? (
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onBlur={finishRenaming}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishRenaming();
                      if (e.key === 'Escape') cancelRenaming();
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    className="rename-input"
                  />
                ) : (
                  <span className="folder-name">{folder.name}</span>
                )}
              </div>
              
              <button 
                className="action-button"
                onClick={(e) => handleFolderActions(e, folder.id)}
                title="More actions"
              >
                <FaEllipsisH />
              </button>
            </div>
            
            {folder.isOpen && folder.children && folder.children.length > 0 && (
              <div className="folder-children">
                {renderFolderStructure(folder.children, level + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const file = item as InvestigationFile;
        return (
          <div 
            key={file.id}
            className={`file-item ${selectedItem?.id === file.id ? 'selected' : ''}`}
            onClick={() => onSelectItem(file)}
          >
            <div className="file-content">
              <FaFile className="file-icon" />
              <span className="file-name">{file.name}</span>
            </div>
            <button 
              className="action-button"
              onClick={(e) => handleFileActions(e, file.id)}
            >
              <FaEllipsisH />
            </button>
          </div>
        );
      }
    });
  };

  return (
    <div 
      className={`folder-sidebar ${className}`} 
      ref={sidebarRef} 
      style={{ width: `${sidebarWidth}%`, position: 'relative' }}
    >
      {/* Resizer handle */}
      {onWidthChange && (
        <div 
          className="resizer" 
          onMouseDown={handleMouseDown} 
          style={{ 
            position: 'absolute', 
            right: 0, 
            top: 0, 
            bottom: 0, 
            width: '5px', 
            cursor: 'ew-resize', 
            backgroundColor: 'transparent' 
          }} 
        />
      )}

      {/* Overlay for closing menus */}
      {overlayVisible && (
        <div 
          className="menu-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowFolderMenu({ show: false });
              setShowFileMenu({ show: false });
              setShowNewItemMenu({ show: false });
              setOverlayVisible(false);
            }
          }}
        />
      )}
      
      {/* Folder header */}
      <div className="folder-header">
        <h3>Folders</h3>
        {onAddItem && (
          <button 
            className="new-root-button"
            onClick={(e) => {
              e.stopPropagation();
              
              // Get button position
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const sidebarRect = document.getElementsByClassName('folder-sidebar')[0].getBoundingClientRect();
              
              // Position menu below button
              setMenuPosition({
                top: rect.bottom - sidebarRect.top, // Position below the button
                left: rect.right - 200 // Align to right edge but adjust left
              });
              
              setShowNewItemMenu({ 
                show: true, 
              });
              setOverlayVisible(true);
            }}
          >
            <FaPlus />
          </button>
        )}
      </div>
      
      {/* Folder list */}
      <div className="folder-list">
        {renderFolderStructure(folders)}
      </div>

      {/* Menu for folder actions */}
      {showFolderMenu.show && (
        <div 
          className="action-menu"
          style={{ 
            position: 'absolute',
            top: `${menuPosition.top}px`, 
            left: `${menuPosition.left}px`,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onRenameItem && (
            <button 
              className="menu-item"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (showFolderMenu.folderId) {
                  // Find folder name
                  const findFolderName = (folders: InvestigationFolder[], id: string): string => {
                    for (const folder of folders) {
                      if (folder.id === id) return folder.name;
                      
                      const subFolders = folder.children.filter(
                        child => child.type === 'folder'
                      ) as InvestigationFolder[];
                      
                      if (subFolders.length > 0) {
                        const foundName = findFolderName(subFolders, id);
                        if (foundName) return foundName;
                      }
                    }
                    return "";
                  };
                  
                  const folderName = findFolderName(folders, showFolderMenu.folderId);
                  startRenaming(e, showFolderMenu.folderId, folderName);
                }
              }}
            >
              Rename
            </button>
          )}
          
          {onAddItem && (
            <>
              <button 
                className="menu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (showFolderMenu.folderId && onAddItem) {
                    onAddItem(showFolderMenu.folderId, 'folder');
                  }
                  setShowFolderMenu({ show: false });
                  setOverlayVisible(false);
                }}
              >
                New Folder
              </button>
              <button 
                className="menu-item"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (showFolderMenu.folderId && onAddItem) {
                    onAddItem(showFolderMenu.folderId, 'file');
                  }
                  setShowFolderMenu({ show: false });
                  setOverlayVisible(false);
                }}
              >
                New File
              </button>
            </>
          )}
          
          {onDeleteItem && (
            <button 
              className="menu-item delete-action"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (showFolderMenu.folderId && onDeleteItem && 
                    window.confirm("Are you sure you want to delete this folder?")) {
                  onDeleteItem(showFolderMenu.folderId);
                }
                setShowFolderMenu({ show: false });
                setOverlayVisible(false);
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Menu for file actions */}
      {showFileMenu.show && (
        <div 
          className="action-menu"
          style={{ 
            position: 'absolute',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onRenameItem && (
            <button 
              className="menu-item"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (showFileMenu.fileId) {
                  // Find file name
                  const findFileName = (items: (InvestigationFolder | InvestigationFile)[], id: string): string => {
                    for (const item of items) {
                      if (item.id === id) return item.name;
                      
                      if (item.type === 'folder') {
                        const found = findFileName((item as InvestigationFolder).children, id);
                        if (found) return found;
                      }
                    }
                    return "";
                  };
                  
                  const fileName = findFileName(folders, showFileMenu.fileId);
                  if (fileName && onRenameItem) {
                    const newName = prompt("Enter new file name:", fileName);
                    if (newName && newName.trim() !== "") {
                      onRenameItem(showFileMenu.fileId, newName.trim());
                    }
                  }
                }
                
                setShowFileMenu({ show: false });
                setOverlayVisible(false);
              }}
            >
              Rename
            </button>
          )}
          
          {onDeleteItem && (
            <button 
              className="menu-item delete-action"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (showFileMenu.fileId && onDeleteItem && 
                    window.confirm("Are you sure you want to delete this file?")) {
                  onDeleteItem(showFileMenu.fileId);
                }
                
                setShowFileMenu({ show: false });
                setOverlayVisible(false);
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Menu for adding new items */}
      {showNewItemMenu.show && onAddItem && (
        <div
          className="action-menu new-item-menu"
          style={{ 
            position: 'absolute',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: '120px',
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="menu-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddItem(null, 'folder');
              setShowNewItemMenu({ show: false });
              setOverlayVisible(false);
            }}
          >
            New Folder
          </button>
          <button
            className="menu-item"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddItem(null, 'file');
              setShowNewItemMenu({ show: false });
              setOverlayVisible(false);
            }}
          >
            New File
          </button>
        </div>
      )}
    </div>
  );
};

export default FolderSidebar; 