import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Image,
  Spinner,
} from "react-bootstrap";
import { Eye, EyeOff, Wallet, UserPlus } from "lucide-react";

import authService from "../services/authService";
//FR1
export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showPass1, setShowPass1] = useState<boolean>(false);
  const [showPass2, setShowPass2] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không trùng khớp!");
      return;
    }

    setIsLoading(true);

    try {
      await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      alert("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err: any) {
      console.error("Lỗi đăng ký:", err);

      const errorData = err.response?.data?.error;

      if (errorData?.code === "VALIDATION_ERROR" && errorData.details) {
        const firstError = errorData.details[0];
        setErrorMsg(`Lỗi nhập liệu: ${firstError.field} - ${firstError.issue}`);
      } else if (errorData?.message) {
        setErrorMsg(errorData.message);
      } else {
        setErrorMsg("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
    >
      <Card
        className="border-0 shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "900px", width: "100%" }}
      >
        <Row className="g-0">
          <Col
            md={6}
            className="d-none d-md-flex p-0"
            style={{ backgroundColor: "#e9f2ff" }}
          >
            <Image
              src="https://res.cloudinary.com/drtp2ufx2/image/upload/v1788519739/Gemini_Generated_Image_vjmmw0vjmmw0vjmm_plqgod.png"
              alt="Finance Illustration"
              className="w-100 h-100"
              style={{ objectFit: "cover" }}
            />
          </Col>

          <Col md={6} className="bg-white p-5">
            <div className="mb-4">
              <h2 className="fw-bold text-primary">Tạo tài khoản mới</h2>
              <p className="text-muted small">
                Bắt đầu hành trình quản lý tài chính thông minh của bạn ngay hôm
                nay.
              </p>
            </div>

            {errorMsg && (
              <Alert variant="danger" className="py-2 fw-medium small">
                {errorMsg}
              </Alert>
            )}

            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3">
                <Form.Control
                  size="lg"
                  type="text"
                  className="bg-light fs-6 border-0"
                  placeholder="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  size="lg"
                  type="email"
                  className="bg-light fs-6 border-0"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Control
                  size="lg"
                  type="text"
                  className="bg-light fs-6 border-0"
                  placeholder="Tên đăng nhập (Username)"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row className="mb-4">
                <Col md={6} className="mb-3 mb-md-0 position-relative">
                  <Form.Control
                    size="lg"
                    type={showPass1 ? "text" : "password"}
                    className="bg-light fs-6 border-0 pe-5"
                    placeholder="Mật khẩu"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div
                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary d-flex"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPass1(!showPass1)}
                  >
                    {showPass1 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </Col>

                <Col md={6} className="position-relative">
                  <Form.Control
                    size="lg"
                    type={showPass2 ? "text" : "password"}
                    className="bg-light fs-6 border-0 pe-5"
                    placeholder="Xác nhận mật khẩu"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <div
                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary d-flex"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPass2(!showPass2)}
                  >
                    {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </Col>
              </Row>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 fs-6 fw-bold rounded-3 d-flex justify-content-center align-items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} className="me-2" /> Đăng ký
                  </>
                )}
              </Button>

              <div className="text-center mt-4 small text-secondary">
                Bạn đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="text-primary text-decoration-none fw-bold"
                >
                  Đăng nhập tại đây.
                </Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}
