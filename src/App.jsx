import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import "./App.css";

const App = () => {
  const [userData, setUserData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");

  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      cell: (row) => renderEditableCell(row, "name"),
    },
    {
      name: "Email",
      selector: (row) => row.email,
      cell: (row) => renderEditableCell(row, "email"),
    },
    {
      name: "Role",
      selector: (row) => row.role,
      cell: (row) => renderEditableCell(row, "role"),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="action">
          {editing === row.id ? (
            <>
              <button className="save btn" onClick={() => handleSaveClick(row)}>
                Save
              </button>
              <button className="btn" onClick={() => handleCancelClick(row)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="edit btn" onClick={() => handleEditClick(row)}>
              Edit
            </button>
          )}
          <button className="delete btn" onClick={() => handleDeleteClick(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#4CAF50", // Green background color
      },
    },
    headCells: {
      style: {
        color: "#FFF", // White text color
        fontSize: "1.2rem", // Font size 1.4rem
      },
    },
  };

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      const result = await response.json();
      const dataWithSelection = result.map((row) => ({
        ...row,
        selected: false,
      }));
      setUserData(dataWithSelection);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckboxChange = (row) => {
    const updatedData = userData.map((dataRow) =>
      dataRow.id === row.id
        ? { ...dataRow, selected: !dataRow.selected }
        : dataRow
    );
    setUserData(updatedData);
  };

  const handleSelectAllCheckboxChange = () => {
    const updatedData = userData.map((dataRow) => ({
      ...dataRow,
      selected: !selectedRows.length,
    }));

    setUserData(updatedData);
  };

  const renderEditableCell = (row, key) => {
    if (editing === row.id) {
      return (
        <input
          type="text"
          value={editedValues[key] || row[key]}
          onChange={(e) => handleEditChange(e, key)}
        />
      );
    }
    return row[key];
  };

  const handleEditClick = (row) => {
    setEditing(row.id);
    setEditedValues({ ...row });
  };

  const handleCancelClick = () => {
    setEditing(null);
    setEditedValues({});
  };

  const handleSaveClick = (row) => {
    setUserData((prevData) =>
      prevData.map((dataRow) =>
        dataRow.id === row.id ? { ...dataRow, ...editedValues } : dataRow
      )
    );

    setEditing(null);
    setEditedValues({});
  };

  const handleEditChange = (e, key) => {
    const value = e.target.value.trim();
    setEditedValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  const handleDeleteClick = (row) => {
    const updatedData = userData.filter((dataRow) => dataRow.id !== row.id);
    setUserData(updatedData);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      alert("No rows selected for deletion");
      return;
    }

    const updatedData = userData.filter((row) => !row.selected);
    const updatedFilteredData = filteredData.filter(
      (row) => !selectedRows.includes(row)
    );

    setUserData(updatedData);
    setSelectedRows([]);
    setSearchText(""); // Clear search text to update filteredData
    setUserData(updatedFilteredData);
  };

  const handleSearch = (text) => {
    setSearchText(text);
  };

  const filteredData = userData.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );
  const handleDeleteAllClick = () => {
    if (userData.length === 0) {
      alert("No rows to delete");
      return;
    }

    setUserData([]);
    setSelectedRows([]);
  };

  return (
    <div className="container">
      <div className="top__box">
        <div>
          <input
            className="search"
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div>
          <button className="delete__all" onClick={handleDeleteAllClick}>
            Delete All
          </button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
        highlightOnHover
        selectableRows
        selectableRowsHighlight
        selectableRowsVisibleOnly
        onSelectedRowsChange={({ selectedRows }) =>
          setSelectedRows(selectedRows)
        }
        customStyles={{
          rows: {
            selectedRowBgColor: "darkgray",
          },
          ...customStyles, // Apply custom styles to the header
        }}
      />
      <div>
        <button className="btn" onClick={handleDeleteSelected}>
          Delete Selected
        </button>
      </div>
    </div>
  );
};

export default App;
