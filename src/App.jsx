import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

const App = () => {
  const [userData, setUserData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [searchText, setSearchText] = useState("");

  const columns = [
    {
      name: "ID",
      selector: "id",
    },
    {
      name: "Name",
      selector: "name",
      cell: (row) => renderEditableCell(row, "name"),
    },
    {
      name: "Email",
      selector: "email",
      cell: (row) => renderEditableCell(row, "email"),
    },
    {
      name: "Role",
      selector: "role",
      cell: (row) => renderEditableCell(row, "role"),
    },
    {
      name: "Action",
      cell: (row) => (
        <div>
          {editing === row.id ? (
            <>
              <button onClick={() => handleSaveClick(row)}>Save</button>
              <button onClick={() => handleCancelClick(row)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => handleEditClick(row)}>Edit</button>
          )}
          <button onClick={() => handleDeleteClick(row)}>Delete</button>
        </div>
      ),
    },
  ];

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
    setSelectAllChecked(updatedData.every((row) => row.selected));
  };

  const handleSelectAllCheckboxChange = () => {
    const updatedData = userData.map((dataRow) => ({
      ...dataRow,
      selected: !selectAllChecked,
    }));

    setUserData(updatedData);
    setSelectAllChecked(!selectAllChecked);
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

  const handleCancelClick = (row) => {
    setEditing(null);
    setEditedValues({});
  };

  const handleSaveClick = (row) => {
    // Update the userData state with the edited values
    setUserData((prevData) =>
      prevData.map((dataRow) =>
        dataRow.id === row.id ? { ...dataRow, ...editedValues } : dataRow
      )
    );

    // Reset editing state
    setEditing(null);
    setEditedValues({});
  };

  const handleEditChange = (e, key) => {
    const value = e.target.value.trim(); // Trim whitespace
    setEditedValues((prevValues) => ({ ...prevValues, [key]: value }));
  };

  const handleDeleteClick = (row) => {
    // Directly modify the userData array
    const updatedData = userData.filter((dataRow) => dataRow.id !== row.id);
    setUserData(updatedData);

    setSelectAllChecked(false);
  };
  const handleDeleteSelected = () => {
    const selectedRows = userData.filter((row) => row.selected);
    console.log(row.selected);
    if (selectedRows.length === 0) {
      alert("No rows selected for deletion");
      return;
    }

    const updatedData = userData.filter((row) => !row.selected);
    setUserData(updatedData);

    setSelectAllChecked(false);
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
    setSelectAllChecked(false);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div>
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div>
          <button onClick={handleDeleteAllClick}>Delete All</button>
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
        customStyles={{
          rows: {
            selectedRowBgColor: "darkgray",
          },
        }}
      />
      <div>
        <button onClick={handleDeleteSelected}>Delete Selected</button>
      </div>
    </div>
  );
};

export default App;
