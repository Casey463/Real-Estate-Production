resource "kubernetes_secret" "backend_env" {
  metadata {
    name = "backend-env"
  }

  type = "Opaque"
  data = {
    for key, value in var.backend_env_secret_values :
    key => value
  }
}

resource "kubernetes_secret" "frontend_env" {
  metadata {
    name = "frontend-env"
  }

  type = "Opaque"
  data = {
    for key, value in var.frontend_env_secret_values :
    key => value
  }
}
