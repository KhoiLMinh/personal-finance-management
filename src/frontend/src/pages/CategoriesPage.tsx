import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Modal, Table, Badge, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { Plus, Edit, Trash2, Tag, Layers, PlusCircle, ArrowLeft, Shield, Eye, ShieldAlert, Tags, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService';
import MySpinner from '../components/MySpinner';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: '',
    type: 'EXPENSE',
    color: '#3b82f6',
    icon: 'Layers',
    parentId: '' as string | number
  });

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [ruleKeyword, setRuleKeyword] = useState('');
  const [ruleLoading, setRuleLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getMyCategories();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', type: 'EXPENSE', color: '#3b82f6', icon: 'Layers', parentId: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (category: any) => {
    if (category.isSystem) return;
    setIsEditing(true);
    setFormData({
      id: category.id,
      name: category.name,
      type: category.type,
      color: category.color || '#3b82f6',
      icon: category.icon || 'Layers',
      parentId: category.parentId || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
        parentId: formData.parentId ? Number(formData.parentId) : null
      };

      if (isEditing && formData.id) {
        await categoryService.updateCategory(formData.id, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      
      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi lưu danh mục!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (error: any) {
        if (window.confirm("Danh mục này đã có giao dịch nên không thể xóa hoàn toàn.\nBạn có muốn ẨN danh mục này đi không?")) {
          try {
            await categoryService.hideCategory(id);
            fetchCategories();
          } catch (hideError) {
            alert("Lỗi khi ẩn danh mục!");
          }
        }
      }
    }
  };

  const handleUnhide = async (id: number) => {
    try {
      await categoryService.unhideCategory(id);
      fetchCategories();
    } catch (error) {
      alert("Lỗi khi gỡ ẩn danh mục!");
    }
  };

  const handleOpenRules = async (category: any) => {
    setSelectedCategory(category);
    setShowRuleModal(true);
    fetchRules(category.id);
  };

  const fetchRules = async (categoryId: number) => {
    setRuleLoading(true);
    try {
      const data = await categoryService.getCategoryRules(categoryId);
      setRules(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách quy tắc:", error);
    } finally {
      setRuleLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKeyword.trim() || !selectedCategory) return;
    try {
      await categoryService.addCategoryRule(selectedCategory.id, { keyword: ruleKeyword.trim(), priority: 0 });
      setRuleKeyword('');
      fetchRules(selectedCategory.id);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi thêm từ khóa!");
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!selectedCategory) return;
    try {
      await categoryService.deleteCategoryRule(selectedCategory.id, ruleId);
      fetchRules(selectedCategory.id);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi xóa từ khóa!");
    }
  };

  const sortedCategories: any[] = [];
  categories.filter(c => !c.parentId).forEach(parent => {
    sortedCategories.push(parent);
    categories.filter(c => c.parentId === parent.id).forEach(child => {
      sortedCategories.push({ ...child, isChild: true, parentName: parent.name });
    });
  });

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>

      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="light" 
              className="rounded-circle p-2 shadow-sm d-flex justify-content-center align-items-center text-secondary border-0"
              style={{ width: '45px', height: '45px' }}
              onClick={() => navigate(-1)} 
              title="Quay lại"
            >
              <ArrowLeft size={24} />
            </Button>
            <div>
              <h3 className="fw-bold text-dark mb-1">Quản lý Danh mục Chi tiêu</h3>
              <p className="text-dark mb-0 opacity-75">Tự do tạo danh mục con từ danh mục hệ thống và quản lý từ khóa tự động</p>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            className="rounded-pill px-4 fw-bold d-flex align-items-center"
            onClick={handleOpenCreate}
          >
            <Plus size={20} className="me-1" /> Thêm danh mục cá nhân
          </Button>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {sortedCategories.map(c => (
          <Col md={4} lg={3} key={c.id}>
            <Card className={`border-0 rounded-4 shadow-sm h-100 ${c.isChild ? 'ms-4' : ''} ${c.hidden ? 'opacity-50 bg-light' : ''}`}>
              <Card.Body className="d-flex flex-column justify-content-between">
                
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: c.color || '#ccc', color: '#fff', filter: c.hidden ? 'grayscale(100%)' : 'none' }}
                  >
                    {c.isSystem ? <Shield size={18} /> : <Layers size={18} />}
                  </div>
                  <div className="min-width-0">
                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '140px' }} title={c.name}>
                      {c.isChild && '↳ '}{c.name}
                      {c.hidden && <span className="text-danger ms-1 small">(Đã ẩn)</span>}
                    </div>
                    {c.isChild ? (
                      <Badge bg="secondary" className="fw-normal text-truncate" style={{ maxWidth: '140px' }}>
                        Con của: {c.parentName}
                      </Badge>
                    ) : (
                      <Badge bg={c.type === 'INCOME' ? 'success' : 'danger'}>
                        {c.type === 'INCOME' ? 'THU NHẬP' : 'CHI TIÊU'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {c.isSystem ? (
                  <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-auto">
                    <Button variant="light" size="sm" className="text-primary fw-medium border-0 px-2 text-start" onClick={() => handleOpenRules(c)}>
                      <Tags size={16} className="me-1" /> Xem từ khóa
                    </Button>
                    <span className="text-muted small fw-medium d-flex align-items-center">
                      <ShieldAlert size={14} className="me-1" /> Hệ thống
                    </span>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between border-top pt-2 mt-auto">
                    <Button variant="light" size="sm" className="text-primary fw-medium border-0 px-2 flex-grow-1 text-start" onClick={() => handleOpenRules(c)}>
                      <Tags size={16} className="me-1" /> Từ khóa
                    </Button>
                    <div className="d-flex gap-1">
                      <Button variant="light" size="sm" className="text-primary border-0 px-2" onClick={() => handleOpenEdit(c)} disabled={c.hidden}>
                        <Edit size={16} />
                      </Button>
                      {c.hidden ? (
                        <Button variant="light" size="sm" className="text-success border-0 px-2" title="Hiện lại danh mục" onClick={() => handleUnhide(c.id)}>
                          <Eye size={16} />
                        </Button>
                      ) : (
                        <Button variant="light" size="sm" className="text-danger border-0 px-2" title="Xóa danh mục" onClick={() => handleDelete(c.id)}>
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-4 text-dark">
            {isEditing ? 'Sửa danh mục' : '+ Thêm danh mục mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4 pt-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-muted fw-medium small">Tên danh mục</Form.Label>
              <Form.Control 
                size="lg" type="text" required className="bg-light border-0" 
                placeholder="VD: Tiền điện nước..."
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Loại thu/chi</Form.Label>
                  <Form.Select 
                    size="lg" className="bg-light border-0"
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value, parentId: ''})}
                    disabled={isEditing} 
                  >
                    <option value="EXPENSE">Khoản chi tiêu (-)</option>
                    <option value="INCOME">Khoản thu nhập (+)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Danh mục cha (Tùy chọn)</Form.Label>
                  <Form.Select 
                    size="lg" className="bg-light border-0"
                    value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  >
                    <option value="">-- Không có --</option>
                    {categories
                      .filter(c => c.type === formData.type && !c.parentId && c.id !== formData.id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Biểu tượng (Icon)</Form.Label>
                  <Form.Select size="lg" className="bg-light border-0" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})}>
                    <option value="Layers">Cơ bản (Layers)</option>
                    <option value="Utensils">Ăn uống (Utensils)</option>
                    <option value="Car">Di chuyển (Car)</option>
                    <option value="ShoppingBag">Mua sắm (Bag)</option>
                    <option value="FileText">Hóa đơn (File)</option>
                    <option value="Activity">Sức khỏe (Activity)</option>
                    <option value="Banknote">Tiền lương (Cash)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Màu nền</Form.Label>
                  <Form.Control type="color" className="w-100 p-1 border-0 rounded-3 bg-light" style={{ height: '48px', cursor: 'pointer' }}
                    value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" className="w-100 py-3 fs-5 fw-bold rounded-4 border-0" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
              {isSubmitting ? <Spinner size="sm" className="me-2"/> : <Save size={20} className="me-2"/>} 
              {isEditing ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showRuleModal} onHide={() => setShowRuleModal(false)} centered scrollable>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-5">
            Từ khóa nhận diện
            <div className="small text-primary mt-1">{selectedCategory?.name}</div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4 pt-3">
          
          {selectedCategory?.isSystem ? (
            <div className="alert alert-secondary py-2 small mb-3 border-0 d-flex align-items-center rounded-3">
              <ShieldAlert size={18} className="me-2 text-secondary flex-shrink-0" />
              Đây là danh mục hệ thống. Bạn có thể xem các từ khóa nhận diện tự động nhưng không thể tùy chỉnh.
            </div>
          ) : (
            <>
              <p className="text-muted small mb-3">
                Hệ thống (Import CSV) sẽ tự động gán giao dịch vào danh mục này nếu mô tả chứa một trong các từ khóa dưới đây.
              </p>
              <Form onSubmit={handleAddRule} className="mb-4">
                <InputGroup>
                  <Form.Control
                    className="bg-light border-0"
                    placeholder="VD: Highlands, Starbucks, Tiền điện..."
                    value={ruleKeyword}
                    onChange={(e) => setRuleKeyword(e.target.value)}
                  />
                  <Button type="submit" variant="primary" className="fw-bold" disabled={!ruleKeyword.trim()}>
                    <PlusCircle size={18} /> Thêm
                  </Button>
                </InputGroup>
              </Form>
            </>
          )}

          {ruleLoading ? (
            <div className="text-center py-4"><Spinner size="sm" variant="primary" /></div>
          ) : rules.length === 0 ? (
            <div className="text-center text-muted small py-4 bg-light rounded-3">Chưa có từ khóa nào.</div>
          ) : (
            <Table hover size="sm" className="align-middle border rounded-3 overflow-hidden">
              <thead className="bg-light text-muted">
                <tr>
                  <th className="py-2 px-3 fw-medium">Từ khóa</th>
                  {!selectedCategory?.isSystem && (
                    <th className="py-2 px-3 fw-medium text-end">Xóa</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-3 fw-bold text-dark">{rule.keyword}</td>
                    {!selectedCategory?.isSystem && (
                      <td className="px-3 text-end">
                        <Button variant="light" size="sm" className="text-danger border-0 p-1" onClick={() => handleDeleteRule(rule.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
}