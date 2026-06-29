resource "kubernetes_deployment" "backend" {
  metadata {
    name = "backend"
    labels = {
      app = "backend"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "backend"
      }
    }
    template {
      metadata {
        labels = {
          app = "backend"
        }
      }
      spec {
        container {
          image = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${data.aws_ecr_repository.backend.name}:${var.backend_image_tag}"
          name  = "backend"
          port {
            container_port = 8000
          }
          env {
            name = "DB_NAME"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_env.metadata[0].name
                key  = "DB_NAME"
              }
            }
          }
          env {
            name = "DB_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_env.metadata[0].name
                key  = "DB_USER"
              }
            }
          }
          env {
            name = "DB_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_env.metadata[0].name
                key  = "DB_PASSWORD"
              }
            }
          }
          env {
            name = "DB_HOST"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_env.metadata[0].name
                key  = "DB_HOST"
              }
            }
          }
          env {
            name = "DB_PORT"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_env.metadata[0].name
                key  = "DB_PORT"
              }
            }
          }
          env {
            name = "BACKEND_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_env.metadata[0].name
                key  = "BACKEND_URL"
              }
            }
          }
          env {
            name = "FRONTEND_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.backend_env.metadata[0].name
                key  = "FRONTEND_URL"
              }
            }
          }
        }
      }
    }
  }

  wait_for_rollout = false
}

resource "kubernetes_service" "backend" {
  metadata {
    name = "backend-service"
    annotations = trimspace(var.acm_certificate_arn) != "" ? {
      "service.beta.kubernetes.io/aws-load-balancer-ssl-cert"         = var.acm_certificate_arn
      "service.beta.kubernetes.io/aws-load-balancer-ssl-ports"        = "443"
      "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
    } : {}
  }
  spec {
    selector = {
      app = kubernetes_deployment.backend.metadata[0].labels.app
    }
    port {
      port        = 80
      target_port = 8000
    }
    dynamic "port" {
      for_each = trimspace(var.acm_certificate_arn) != "" ? [1] : []
      content {
        port        = 443
        target_port = 8000
      }
    }
    type = "LoadBalancer"
  }

  wait_for_load_balancer = false
}
