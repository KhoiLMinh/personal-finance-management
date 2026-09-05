import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
import { Eye, EyeOff, Wallet, LogIn } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

import authService from "../services/authService";
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string | null;
  role: "ADMIN" | "USER";
  provider: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export default function LoginPage() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam) {
      if (errParam === "session_expired") {
        setErrorMsg("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      } else {
        setErrorMsg(errParam);
      }
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response: AuthResponse = await authService.login({
        username,
        password,
      });
      login(response.user, response.token);

      if (response.user.role === "ADMIN") {
        navigate("/admin/users");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error?.message) {
        setErrorMsg(err.response.data.error.message);
      } else {
        setErrorMsg("Lỗi kết nối máy chủ. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.googleLogin({
        googleToken: credentialResponse.credential,
      });

      login(response.user, response.token);

      if (response.user.role === "ADMIN") {
        navigate("/admin/users");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.error?.message || "Đăng nhập Google thất bại!",
      );
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
              <h2 className="fw-bold text-primary">Đăng nhập</h2>
              <p className="text-muted small">
                Quản lý thu chi, ngân sách và đạt được mục tiêu tài chính của
                bạn.
              </p>
            </div>

            {errorMsg && (
              <Alert variant="danger" className="py-2 fw-medium small">
                {errorMsg}
              </Alert>
            )}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Control
                  size="lg"
                  type="text"
                  className="bg-light fs-6 border-0"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group
                className="mb-4 position-relative"
                controlId="formPassword"
              >
                <Form.Control
                  size="lg"
                  type={showPassword ? "text" : "password"}
                  className="bg-light fs-6 border-0 pe-5"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary d-flex"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </Form.Group>

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
                      className="me-2"
                    />{" "}
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    <LogIn size={20} className="me-2" /> Đăng nhập
                  </>
                )}
              </Button>

              <div className="d-flex align-items-center my-4">
                <div className="border-bottom flex-grow-1"></div>
                <span className="px-3 text-muted small fw-medium">HOẶC</span>
                <div className="border-bottom flex-grow-1"></div>
              </div>

              <div className="d-flex justify-content-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setErrorMsg(
                      "Cửa sổ đăng nhập Google đã bị đóng hoặc có lỗi xảy ra.",
                    )
                  }
                  useOneTap
                  theme="outline"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              <div className="text-center mt-4 small text-secondary">
                Bạn chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-primary text-decoration-none fw-bold"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}
