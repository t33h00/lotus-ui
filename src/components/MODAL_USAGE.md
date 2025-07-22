# Modal Component Usage Guide

## Basic Usage

### 1. Import the Modal component and useModal hook:
```javascript
import Modal from './Modal';
import useModal from './useModal';
```

### 2. Use the hook in your component:
```javascript
function YourComponent() {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedItemId, setSelectedItemId] = useState(null);

  const handleEdit = (id) => {
    setSelectedItemId(id);
    openModal();
  };

  return (
    <>
      {/* Your component content */}
      <button onClick={() => handleEdit(itemId)}>Edit Item</button>
      
      {/* Modal */}
      {isOpen && (
        <Modal isOpen={isOpen} onClose={closeModal}>
          <YourEditComponent 
            itemId={selectedItemId}
            onClose={closeModal}
          />
        </Modal>
      )}
    </>
  );
}
```

## Modal Props

### Required Props:
- `isOpen`: Boolean - Controls modal visibility
- `onClose`: Function - Called when modal should close
- `children`: React nodes - Content to display in modal

### Optional Props:
- `maxWidth`: String (default: "600px") - Maximum width of modal
- `maxHeight`: String (default: "90vh") - Maximum height of modal

## Example with Custom Sizing:
```javascript
<Modal 
  isOpen={isOpen} 
  onClose={closeModal}
  maxWidth="800px"
  maxHeight="80vh"
>
  <LargeEditComponent />
</Modal>
```

## Features:
- Click outside to close
- Escape key to close (can be added)
- Responsive design
- Smooth animations
- Portal rendering (renders outside component tree)
- Prevents scroll on background
- Customizable sizing

## Use Cases:
- Edit forms
- Detail views
- Confirmation dialogs
- Image galleries
- Any overlay content
