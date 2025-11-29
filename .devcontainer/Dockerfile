FROM mcr.microsoft.com/devcontainers/base:ubuntu
ARG NODE_VERSION=22

# Install git-lfs so devcontainer users can push without missing hooks
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		ca-certificates \
		curl \
		git \
		gnupg \
		lsb-release \
	&& curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash \
	&& apt-get install -y --no-install-recommends git-lfs \
	&& git lfs install --system \
	&& rm -rf /var/lib/apt/lists/*

RUN su vscode -c "corepack enable && corepack prepare pnpm@8.11.0 --activate"
