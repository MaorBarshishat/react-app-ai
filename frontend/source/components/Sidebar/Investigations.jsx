import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaFolder, FaFolderOpen, FaSearch, FaSearchPlus, FaFolderPlus } from 'react-icons/fa';
import NewFolderModal from '../modals/NewFolderModal';
import NewInvestigationModal from '../modals/NewInvModal';
import '../../styles/Investigations.css';


function createInvestigationData() {
  // Define the filled investigation data
  const filledInvestigationDataArray = [
    {
        "Inc 803 - gift cards abuse": {
            dateRanges: [
                { from: "2025-03-14", to: "2025-03-20" },
                { from: "2025-03-21", to: "2025-03-25" },
                { from: "2025-03-26", to: "2025-04-01" }
            ],
            relatedAssets: "giftcard_abuser@example.com",
            domains: "giftcard;online-store;",
            description: "Investigation of fraudulent activities related to gift cards, including unauthorized purchases and misuse."
        }
    },
    {
        "Inc 917 - gift cards fake wallets": {
            dateRanges: [
                { from: "2025-03-15", to: "2025-03-22" },
                { from: "2025-03-23", to: "2025-03-29" }
            ],
            relatedAssets: "fakewallets@example.com",
            domains: "wallet;giftcard;",
            description: "Analysis of fake wallet applications used for illicit transactions involving gift cards."
        }
    },
    {
        "Inc 989 - return policy abuse 3": {
            dateRanges: [
                { from: "2025-03-16", to: "2025-03-23" },
                { from: "2025-03-24", to: "2025-03-30" },
                { from: "2025-03-31", to: "2025-04-03" }
            ],
            relatedAssets: "returnpolicy.abuser@example.com",
            domains: "returns;e-commerce;",
            description: "Study of abuse of return policies leading to loss of revenue and oversight in transactions."
        }
    },
    {
        "Unknown investigation": {
            dateRanges: [
                { from: "2025-03-17", to: "2025-03-24" },
                { from: "2025-03-25", to: "2025-03-31" },
                { from: "2025-04-01", to: "2025-04-04" }
            ],
            relatedAssets: "unknown.investigator@example.com",
            domains: "unknown;suspected-abuse;",
            description: "General investigation into unidentified activities affecting the e-commerce platform."
        }
    },
    {
        "Inc 811 - Mass ATO may 24": {
            dateRanges: [
                { from: "2025-03-18", to: "2025-03-25" },
                { from: "2025-03-26", to: "2025-04-01" }
            ],
            relatedAssets: "massato@example.com",
            domains: "trust;identity;",
            description: "Examination of mass account takeovers on May 24, leading to privacy breaches."
        }
    },
    {
        "Inc 997 - Distributed AOF": {
            dateRanges: [
                { from: "2025-03-19", to: "2025-03-26" },
                { from: "2025-03-27", to: "2025-04-02" },
                { from: "2025-04-03", to: "2025-04-05" }
            ],
            relatedAssets: "distributed.aof@example.com",
            domains: "identity;security;",
            description: "Investigation into distributed attacks on authentication fields related to identity theft."
        }
    },
    {
        "Inc 1006 - Attack from Malezia": {
            dateRanges: [
                { from: "2025-03-20", to: "2025-03-27" },
                { from: "2025-03-28", to: "2025-04-04" }
            ],
            relatedAssets: "malezia.attack@example.com",
            domains: "security;identity;",
            description: "Analysis of attacks originating from Malezia targeting user identity verification."
        }
    }
];
  localStorage.clear(); // Clear local storage
  filledInvestigationDataArray.forEach(investigation => {
  for (const [key, value] of Object.entries(investigation)) {
    const filledInvestigationData = JSON.parse(localStorage.getItem('filledInvestigationData')) || {};
    filledInvestigationData[key] = value;
    localStorage.setItem('filledInvestigationData', JSON.stringify(filledInvestigationData)); // Save to local storage

  }
});
}

createInvestigationData();

const Investigations = () => {
  const [investigationNodes, setInvestigationNodes] = useState([
    { submenu: "E-commerce abuse investigations", subinvestigationItems: ['Inc 803 - gift cards abuse', 'Inc 917 - gift cards fake wallets', 'Inc 989 - return policy abuse 3', 'Unknown investigation'] },
    { submenu: "Trust and identity investigations", subinvestigationItems: ['Inc 811 - Mass ATO may 24', 'Inc 997 - Distributed AOF', 'Inc 1006 - Attack from Malezia'] },
    { submenu: "Trust and identity investigations v2-2", subinvestigationItems: ['Inc 811 - Mass ATO may 24', 'Inc 997 - Distributed AOF', 'Inc 1006 - Attack from Malezia'] },
  ]);


  // filledInvestigationDataArray.forEach(investigation => {
  //   const filledInvestigationData = JSON.parse(localStorage.getItem('filledInvestigationData')) || {};
  //   console.log(investigation.key);
  //   // filledInvestigationData[[(investigation);
  //   // console.log(filledInvestigationData);

  //   // localStorage.setItem('filledInvestigationData', JSON.stringify(filledInvestigationData)); // Save to local storage
  // });

  const [openInvestigations, setOpenInvestigations] = useState([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewInvestigationModal, setShowNewInvestigationModal] = useState(false);
  const [formInputs, setFormInputs] = useState({ folderName: '', investigationName: '' });

  const toggleNewFolderModal = () => setShowNewFolderModal(prev => !prev);
  
  const toggleNewInvestigationModal = (folder) => {
    setShowNewInvestigationModal(prev => {
      setFormInputs({ investigationName: '' , folderName: folder}); // Reset on close
      return !prev;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormInputs(prevInputs => ({ ...prevInputs, [name]: value }));
  };

  const handleSaveNewFolder = () => {
    const { folderName } = formInputs;
    if (investigationNodes.some(node => node.submenu === folderName)) {
      alert("This folder already exists!");
    } else {
      setInvestigationNodes(prevNodes => [...prevNodes, { submenu: folderName, subinvestigationItems: [] }]);
      toggleNewFolderModal();
      setFormInputs({ folderName: '', investigationName: '' });
    }
  };

  const handleSaveNewInvestigation = (investigationName, folderName) => {
    const exists = investigationNodes.some(node => 
      node.subinvestigationItems.includes(investigationName)
    );

    if (exists) {
      return; // Exit the function if the investigation already exists
    }

    const newInvestigationNodes = [...investigationNodes];

    // Find the folder by name and add the investigation to the correct subinvestigationItems
    const folderIndex = newInvestigationNodes.findIndex(node => node.submenu === folderName);
    if (folderIndex !== -1) {
        newInvestigationNodes[folderIndex].subinvestigationItems.push(investigationName);
        setInvestigationNodes(newInvestigationNodes); // Update the state with the new nodes

        // Clear the investigationName in formInputs
        setFormInputs(prevInputs => ({ ...prevInputs, folderName: '', investigationName: '' }));
    } else {
        alert("Folder not found!"); // Alert if the folder couldn't be found
    }
  };

  const toggleInvestigations = (menu) => {
    setFormInputs({folderName: '', investigationName: ''}); // Reset form inputs
    setOpenInvestigations(prevOpen =>
      prevOpen.includes(menu) ? prevOpen.filter(item => item !== menu) : [...prevOpen, menu]
    );
  };

  const handleOpenInvestigationModal = (subNode, folder) => {
    setFormInputs(prev => ({ ...prev, investigationName: subNode, folderName: folder })); // Set the investigation name and folder
    setShowNewInvestigationModal(true); // Open the modal
  };

  return (
    <div>
      <Button variant="primary" onClick={toggleNewFolderModal}>
        <FaFolderPlus size={16} style={{ color: 'white' }} />
      </Button>

      <NewFolderModal
        show={showNewFolderModal}
        onClose={toggleNewFolderModal}
        onSave={handleSaveNewFolder}
        folderName={formInputs.folderName}
        onChange={handleChange}
      />

      <NewInvestigationModal
        show={showNewInvestigationModal}
        onClose={toggleNewInvestigationModal}
        onSave={handleSaveNewInvestigation} // Pass the save function
        investigationName={formInputs.investigationName}
        folderName={formInputs.folderName} // Pass folder name to modal
        onChange={handleChange}
      />

      {investigationNodes.map((node) => (
        <div key={node.submenu}>
          <button
            onClick={() => toggleInvestigations(node.submenu)}
            className="investigation-item"
            style={{ 
              width: '100%', 
              fontSize: '16px', 
              marginTop: '15px', 
              backgroundColor: 'transparent', 
              color: 'white', 
              border: 'none', 
              textAlign: 'left', 
              padding: '10px' 
            }}
          >
            {openInvestigations.includes(node.submenu) ? <FaFolderOpen /> : <FaFolder />} &nbsp; {node.submenu}
          </button>

          {/* Subinvestigations */}
          {openInvestigations.includes(node.submenu) && (
            <div className="subinvestigation-list" style={{ paddingLeft: '20px', paddingRight: '30px' }}>
              {node.subinvestigationItems.map((subNode) => (
                <div key={subNode}>
                  <button 
                    onClick={() => handleOpenInvestigationModal(subNode, node.submenu)} // Open modal with subNode as investigation name and node.submenu as folder
                    className="subinvestigation-item" 
                    style={{ backgroundColor: 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 0' }}
                  >
                    <FaSearch />&nbsp; {subNode}
                  </button>
                </div>
              ))}
              <div>
              <Button variant="primary" onClick={()=>toggleNewInvestigationModal(node.submenu)} style={{ marginTop: '10px' }}>
                  <FaSearchPlus size={14} style={{ color: 'white' }} />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Investigations;