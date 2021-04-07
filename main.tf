terraform {
  backend "local" {}
}

provider "helm" {
}

resource "helm_release" "nginx_ingress" {
  name       = "nginx-ingress-controller"

  repository = "https://charts.bitnami.com/bitnami"
  chart      = "nginx-ingress-controller"

  set {
    name  = "service.type"
    value = "ClusterIP"
  }
}


resource "null_resource" "example1" {
  provisioner "local-exec" {
    command = "echo 'Hello World'"
  }
}
