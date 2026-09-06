import React from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Search } from "lucide-react";

interface Props {
  filterType: string;
  setFilterType: (type: string) => void;
  search: string;
  setSearch: (text: string) => void;
}

export default function TransactionFilter({
  filterType,
  setFilterType,
  search,
  setSearch,
}: Props) {
  const types = [
    { label: "Tất cả giao dịch", value: "ALL" },
    { label: "Thu", value: "INCOME" },
    { label: "Chi", value: "EXPENSE" },
  ];

  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div className="d-flex gap-2 p-1 bg-white rounded-pill shadow-sm border">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilterType(t.value)}
            className={`btn rounded-pill fw-medium border-0 px-4 py-2 ${
              filterType === t.value
                ? "btn-info text-white"
                : "btn-light text-muted bg-transparent"
            }`}
            style={
              filterType === t.value
                ? { backgroundColor: "var(--color-primary)" }
                : {}
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ width: "300px" }}>
        <InputGroup className="shadow-sm rounded-pill overflow-hidden border bg-white">
          <InputGroup.Text className="bg-white border-0 text-muted ps-3">
            <Search size={18} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Tìm kiếm giao dịch..."
            className="border-0 shadow-none bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>
    </div>
  );
}
