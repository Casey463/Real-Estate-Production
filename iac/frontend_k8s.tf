resource "kubernetes_deployment" "frontend" {
  metadata {
    name = "frontend"
    labels = {
      app = "frontend"
    }
  }
  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "frontend"
      }
    }
    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }
      spec {
        container {
          image = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${data.aws_ecr_repository.frontend.name}:${var.frontend_image_tag}"
          name  = "frontend"
          port {
            container_port = 3000
          }
          env {
            name = "NEXT_PUBLIC_BASE_API_URL"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.frontend_env.metadata[0].name
                key  = "NEXT_PUBLIC_BASE_API_URL"
              }
            }
          }
        }
      }
    }
  }

  wait_for_rollout = false
}

resource "kubernetes_service" "frontend" {
  metadata {
    name = "frontend-service"
    annotations = trimspace(var.acm_certificate_arn) != "" ? {
      "service.beta.kubernetes.io/aws-load-balancer-ssl-cert"         = var.acm_certificate_arn
      "service.beta.kubernetes.io/aws-load-balancer-ssl-ports"        = "443"
      "service.beta.kubernetes.io/aws-load-balancer-backend-protocol" = "http"
    } : {}
  }
  spec {
    selector = {
      app = kubernetes_deployment.frontend.metadata[0].labels.app
    }
    port {
      port        = 80
      target_port = 3000
    }
    dynamic "port" {
      for_each = trimspace(var.acm_certificate_arn) != "" ? [1] : []
      content {
        port        = 443
        target_port = 3000
      }
    }
    type = "LoadBalancer"
  }

  wait_for_load_balancer = false
}
