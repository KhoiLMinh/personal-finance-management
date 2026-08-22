import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { Layers, Plus, Trash2, Save } from 'lucide-react';
import categoryService from '../../services/categoryService';
import MySpinner from '../../components/MySpinner';
//FR-15
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    color: '#3b82f6',
    icon: 'Layers'
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getMyCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await categoryService.createCategory(formData);
      setShowModal(false);
      setFormData({ name: '', type: 'EXPENSE', color: '#3b82f6', icon: 'Layers' });
      fetchCategories(); 
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi tạo danh mục!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Xóa danh mục này? Lưu ý: Không thể xóa nếu danh mục đã có giao dịch.")) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa danh mục!");
      }
    }
  };

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>

      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white p-2 rounded-circle shadow-sm">
              <Layers size={32} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="fw-bold text-dark mb-1">Danh mục hệ thống mặc định</h3>
              <p className="text-dark mb-0 opacity-75">Tạo các danh mục Thu/Chi tiêu chuẩn cho ứng dụng</p>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            className="rounded-pill px-4 fw-bold d-flex align-items-center"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} className="me-1" /> Thêm danh mục
          </Button>
        </Card.Body>
      </Card>


      <Row className="g-3">
        {categories.map(c => (
          <Col md={4} lg={3} key={c.id}>
            <Card className="border-0 rounded-4 shadow-sm h-100">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: c.color || '#ccc', color: '#fff' }}
                  >
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '120px' }}>{c.name}</div>
                    <Badge bg={c.type === 'INCOME' ? 'success' : 'danger'}>
                      {c.type === 'INCOME' ? 'THU NHẬP' : 'CHI TIÊU'}
                    </Badge>
                  </div>
                </div>
                <Button variant="light" size="sm" className="text-danger border-0 flex-shrink-0" onClick={() => handleDelete(c.id)}>
                  <Trash2 size={16} />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-4">+ Thêm Danh mục mới</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4 pt-3">
          <Form onSubmit={handleCreate}>
            
            <Form.Group className="mb-3">
              <Form.Label className="text-muted fw-medium small">Tên danh mục</Form.Label>
              <Form.Control 
                size="lg" 
                type="text" 
                required 
                className="bg-light border-0" 
                placeholder="VD: Tiền điện nước..."
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted fw-medium small">Loại thu/chi</Form.Label>
              <Form.Select 
                size="lg" 
                className="bg-light border-0"
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="EXPENSE">Khoản chi tiêu (-)</option>
                <option value="INCOME">Khoản thu nhập (+)</option>
              </Form.Select>
            </Form.Group>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Biểu tượng (Icon)</Form.Label>
                  <Form.Select 
                    size="lg" 
                    className="bg-light border-0"
                    value={formData.icon} 
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  >
                    <option value="Layers">Cơ bản (Layers)</option>
                    <option value="Utensils">Ăn uống (Utensils)</option>
                    <option value="Car">Di chuyển (Car)</option>
                    <option value="ShoppingBag">Mua sắm (Shopping Bag)</option>
                    <option value="FileText">Hóa đơn (File Text)</option>
                    <option value="Activity">Sức khỏe (Activity)</option>
                    <option value="Banknote">Tiền lương (Banknote)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Màu nền</Form.Label>
                  <Form.Control 
                    type="color" 
                    className="w-100 p-1 border-0 rounded-3 bg-light" 
                    style={{ height: '48px', cursor: 'pointer' }}
                    value={formData.color} 
                    onChange={(e) => setFormData({...formData, color: e.target.value})} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" className="w-100 py-3 fs-5 fw-bold rounded-4 border-0 d-flex align-items-center justify-content-center" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
              {isSubmitting ? <Spinner size="sm" className="me-2"/> : <Save size={20} className="me-2"/>} 
              Lưu danh mục
            </Button>
            
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
}