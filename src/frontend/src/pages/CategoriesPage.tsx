import React, { useCallback, useEffect, useState } from 'react';
import { Button, ButtonGroup, Form, Modal, Spinner, InputGroup, Alert, Row, Col } from 'react-bootstrap';
import { Plus, Pencil, Trash2, Eye, Tags, Lock } from 'lucide-react';
import categoryService from '../services/categoryService';
import type { Category, TxType } from '../types/finance';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageState';

interface Rule { id: number; keyword: string }

const SWATCHES = ['#2348c9', '#0f7f4f', '#a15c07', '#b42318', '#7c3aed', '#0e7490', '#be185d', '#475569'];
const ICONS = [
  ['Layers', 'Cơ bản'], ['Utensils', 'Ăn uống'], ['Car', 'Di chuyển'], ['ShoppingBag', 'Mua sắm'],
  ['FileText', 'Hóa đơn'], ['Activity', 'Sức khỏe'], ['Banknote', 'Tiền lương'],
] as const;

const emptyForm = (type: TxType) => ({ id: null as number | null, name: '', type, color: SWATCHES[0], icon: 'Layers', parentId: '' as string | number });

/** `admin`: the admin's own categories are the system templates cloned to new users, so they stay editable. */
export default function CategoriesPage({ admin = false }: { admin?: boolean }) {
  const locked = (c: Category) => c.system && !admin;
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<TxType>('EXPENSE');
  const [showHidden, setShowHidden] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm('EXPENSE'));

  const [ruleCategory, setRuleCategory] = useState<Category | null>(null);
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [ruleKeyword, setRuleKeyword] = useState('');
  const [ruleError, setRuleError] = useState('');

  const load = useCallback(async () => {
    setError(false);
    try {
      setCategories(await categoryService.getMyCategories());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setFormError(''); setFormData(emptyForm(tab)); setShowModal(true); };
  const openEdit = (c: Category) => {
    if (locked(c)) return;
    setFormError('');
    setFormData({ id: c.id, name: c.name, type: c.type, color: c.color || SWATCHES[0], icon: c.icon || 'Layers', parentId: c.parentId || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = { name: formData.name, type: formData.type, icon: formData.icon, color: formData.color, parentId: formData.parentId ? Number(formData.parentId) : null };
      if (formData.id) await categoryService.updateCategory(formData.id, payload);
      else await categoryService.createCategory(payload);
      setShowModal(false);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Không lưu được danh mục. Thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (c: Category) => {
    const question = admin
      ? `Xóa danh mục mẫu "${c.name}"?

Người dùng đã được sao chép danh mục này vẫn giữ nguyên; chỉ người đăng ký sau sẽ không có nó.`
      : `Xóa danh mục "${c.name}"?`;
    if (!window.confirm(question)) return;
    try {
      await categoryService.deleteCategory(c.id);
      load();
    } catch (err: any) {
      if (admin) {
        alert(err.response?.data?.error?.message || 'Không xóa được danh mục mẫu.');
        return;
      }
      // categories in use cannot be deleted; hiding keeps history intact
      const reason = err.response?.data?.error?.message || 'Danh mục đang được sử dụng nên không xóa được.';
      if (!window.confirm(`${reason}\n\nẨn danh mục "${c.name}" để không chọn được nữa nhưng vẫn giữ lịch sử?`)) return;
      try {
        await categoryService.hideCategory(c.id);
        load();
      } catch {
        alert('Không ẩn được danh mục. Thử lại sau.');
      }
    }
  };

  const handleUnhide = async (c: Category) => {
    try {
      await categoryService.unhideCategory(c.id);
      load();
    } catch {
      alert('Không hiện lại được danh mục. Thử lại sau.');
    }
  };

  const loadRules = async (c: Category) => {
    setRules(null);
    setRuleError('');
    try {
      setRules(await categoryService.getCategoryRules(c.id));
    } catch {
      setRuleError('Không tải được từ khóa.');
      setRules([]);
    }
  };
  const openRules = (c: Category) => { setRuleCategory(c); setRuleKeyword(''); loadRules(c); };

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKeyword.trim() || !ruleCategory) return;
    try {
      await categoryService.addCategoryRule(ruleCategory.id, { keyword: ruleKeyword.trim(), priority: 0 });
      setRuleKeyword('');
      loadRules(ruleCategory);
    } catch (err: any) {
      setRuleError(err.response?.data?.error?.message || 'Không thêm được từ khóa.');
    }
  };

  const deleteRule = async (ruleId: number) => {
    if (!ruleCategory) return;
    try {
      await categoryService.deleteCategoryRule(ruleCategory.id, ruleId);
      loadRules(ruleCategory);
    } catch (err: any) {
      setRuleError(err.response?.data?.error?.message || 'Không xóa được từ khóa.');
    }
  };

  const ofTab = (categories ?? []).filter((c) => c.type === tab && (showHidden || !c.hidden));
  const hiddenCount = (categories ?? []).filter((c) => c.type === tab && c.hidden).length;
  const rows: { c: Category; child: boolean }[] = [];
  ofTab.filter((c) => !c.parentId).forEach((p) => {
    rows.push({ c: p, child: false });
    ofTab.filter((c) => c.parentId === p.id).forEach((c) => rows.push({ c, child: true }));
  });

  const row = ({ c, child }: { c: Category; child: boolean }) => (
    <li key={c.id} className={`d-flex align-items-center gap-3 py-2 border-bottom ${child ? 'ps-5 pe-3' : 'px-3'} ${c.hidden ? 'opacity-50' : ''}`}>
      <span aria-hidden className="rounded-circle flex-shrink-0" style={{ width: 10, height: 10, background: c.color || 'var(--ink-muted)' }} />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <span className={`text-truncate ${child ? '' : 'fw-medium'}`}>{child && <span className="text-secondary">↳ </span>}{c.name}</span>
        {c.hidden && <span className="status-pill neutral ms-2">Đã ẩn</span>}
        {locked(c) && <span className="status-pill neutral ms-2"><Lock size={10} aria-hidden /> Hệ thống</span>}
      </div>
      <div className="d-flex flex-shrink-0">
        <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Từ khóa tự phân loại của ${c.name}`} onClick={() => openRules(c)}><Tags size={16} aria-hidden /></Button>
        {!locked(c) && !c.hidden && (
          <>
            <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Sửa ${c.name}`} onClick={() => openEdit(c)}><Pencil size={16} aria-hidden /></Button>
            <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Xóa ${c.name}`} onClick={() => handleDelete(c)}><Trash2 size={16} aria-hidden /></Button>
          </>
        )}
        {!locked(c) && c.hidden && (
          <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Hiện lại ${c.name}`} onClick={() => handleUnhide(c)}><Eye size={16} aria-hidden /></Button>
        )}
      </div>
    </li>
  );

  return (
    <div className="page">
      <div className="page-toolbar">
        <ButtonGroup size="sm" aria-label="Loại danh mục">
          {(['EXPENSE', 'INCOME'] as const).map((t) => (
            <Button key={t} variant={tab === t ? 'primary' : 'outline-secondary'} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'}
            </Button>
          ))}
        </ButtonGroup>
        <Button onClick={openCreate} className="d-inline-flex align-items-center gap-1"><Plus size={18} aria-hidden /> Thêm danh mục</Button>
      </div>

      <section className="panel">
        {error ? (
          <ErrorState onRetry={load} />
        ) : categories === null ? (
          <LoadingState />
        ) : rows.length === 0 ? (
          <EmptyState title={`Chưa có danh mục ${tab === 'EXPENSE' ? 'chi tiêu' : 'thu nhập'}`} action={<Button size="sm" onClick={openCreate}>Thêm danh mục</Button>} />
        ) : (
          <ul className="list-unstyled mb-0">{rows.map(row)}</ul>
        )}
        {hiddenCount > 0 && (
          <div className="px-3 py-2">
            <Form.Check type="switch" id="show-hidden" label={`Hiện ${hiddenCount} danh mục đã ẩn`} checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} className="small" />
          </div>
        )}
      </section>
      <p className="small text-secondary mt-2 mb-0">
        {admin
          ? 'Đây là bộ danh mục mẫu. Danh mục và từ khóa thêm ở đây được sao chép cho mọi người dùng; người dùng mới nhận toàn bộ bộ mẫu khi đăng ký.'
          : 'Danh mục hệ thống do quản trị viên cấu hình, bạn có thể thêm danh mục con bên dưới chúng.'}
      </p>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">{formData.id ? 'Sửa danh mục' : 'Thêm danh mục'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger" className="py-2 small">{formError}</Alert>}
            <Form.Group className="mb-3" controlId="cat-name">
              <Form.Label className="small text-secondary">Tên danh mục</Form.Label>
              <Form.Control required maxLength={100} placeholder="VD: Tiền điện nước" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Form.Group>
            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Group controlId="cat-type">
                  <Form.Label className="small text-secondary">Loại</Form.Label>
                  <Form.Select value={formData.type} disabled={!!formData.id} onChange={(e) => setFormData({ ...formData, type: e.target.value as TxType, parentId: '' })}>
                    <option value="EXPENSE">Chi tiêu</option>
                    <option value="INCOME">Thu nhập</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group controlId="cat-parent">
                  <Form.Label className="small text-secondary">Thuộc danh mục</Form.Label>
                  <Form.Select value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}>
                    <option value="">Không (danh mục gốc)</option>
                    {(categories ?? []).filter((c) => c.type === formData.type && !c.parentId && c.id !== formData.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group controlId="cat-icon">
                  <Form.Label className="small text-secondary">Biểu tượng</Form.Label>
                  <Form.Select value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}>
                    {ICONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <fieldset>
              <legend className="small text-secondary mb-1" style={{ fontSize: 'var(--fs-sm)' }}>Màu</legend>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {SWATCHES.map((c) => (
                  <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Màu ${c}`} aria-pressed={formData.color === c} onClick={() => setFormData({ ...formData, color: c })} />
                ))}
                <Form.Control type="color" aria-label="Chọn màu khác" className="form-control-color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              </div>
            </fieldset>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}{formData.id ? 'Lưu thay đổi' : 'Thêm danh mục'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={ruleCategory !== null} onHide={() => setRuleCategory(null)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">Từ khóa tự phân loại · {ruleCategory?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-secondary">
            Khi nhập sao kê, giao dịch có nội dung chứa một trong các từ khóa này sẽ tự vào danh mục {ruleCategory?.name}.
          </p>
          {ruleError && <Alert variant="danger" className="py-2 small">{ruleError}</Alert>}
          {ruleCategory && locked(ruleCategory) ? (
            <p className="small text-secondary">Đây là danh mục hệ thống: bạn xem được từ khóa nhưng không sửa được.</p>
          ) : (
            <Form onSubmit={addRule} className="mb-3">
              <InputGroup>
                <Form.Control aria-label="Từ khóa mới" placeholder="VD: Highlands, Grab" value={ruleKeyword} onChange={(e) => setRuleKeyword(e.target.value)} />
                <Button type="submit" disabled={!ruleKeyword.trim()}>Thêm</Button>
              </InputGroup>
            </Form>
          )}
          {rules === null ? (
            <LoadingState compact />
          ) : rules.length === 0 ? (
            <p className="small text-secondary mb-0">Chưa có từ khóa nào.</p>
          ) : (
            <ul className="list-unstyled d-flex flex-wrap gap-2 mb-0">
              {rules.map((r) => (
                <li key={r.id} className="status-pill neutral" style={{ fontSize: 'var(--fs-sm)' }}>
                  {r.keyword}
                  {!(ruleCategory && locked(ruleCategory)) && (
                    <Button variant="link" size="sm" className="p-0 ms-1 text-secondary lh-1" aria-label={`Xóa từ khóa ${r.keyword}`} onClick={() => deleteRule(r.id)}>×</Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
