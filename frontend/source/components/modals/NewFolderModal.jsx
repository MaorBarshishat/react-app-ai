import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const NewFolderModal = ({ show, onClose, onSave, folderName, onChange }) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create New Folder</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          type="text"
          name="folderName"
          value={folderName}
          onChange={onChange}
          placeholder="Enter folder name"
          style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} // Some basic styling
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={onSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewFolderModal;