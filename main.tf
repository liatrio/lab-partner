terraform {
  backend "local" {}
}

provider "helm" {
}

resource "kubernetes_namespace" "rode" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "rode" {
  name       = "rode"
  namespace  = kubernetes_namespace.rode.metadata[0].name
  chart      = "rode"
  repository = "https://rode.github.io/charts"
  version    = "0.1.2"
  wait       = true

}

resource "null_resource" "example1" {
  provisioner "local-exec" {
    command = "echo 'Hello World'"
  }
}
