remote_state  {
  backend = "s3"
  config = {
    bucket = "github-runners-774051255656-lead.liatr.io"
    region = "us-east-1"
    key    = "${get_env("GITHUB_REPOSITORY", "UNDEFINED")}-terraform.tfstate"
    encrypt = true
    dynamodb_table = "github-runners-lead"
    s3_bucket_tags = {
      owner = "Terragrunt"
      name  = "Terraform State Manager"
    }
    dynamodb_table_tags = {
      owner = "Terragrunt"
      name  = "Terraform Lock Table"
    }
}

provider "helm" {
}

resource "kubernetes_namespace" "rode" {
  metadata {
    name = "rode-runner-demo"
  }
}

resource "helm_release" "rode" {
  name       = "rode"
  namespace  = kubernetes_namespace.rode.metadata[0].name
  chart      = "rode"
  repository = "https://rode.github.io/charts"
  version    = "0.1.2"
  wait       = true

  set_sensitive {
    name = "grafeas-elasticsearch.grafeas.elasticsearch.username"
    value = "test"
  }
  set_sensitive {
    name = "grafeas-elasticsearch.grafeas.elasticsearch.password"
    value = "test"
  }
}

resource "null_resource" "example1" {
  provisioner "local-exec" {
    command = "echo 'Hello World'"
  }
}
